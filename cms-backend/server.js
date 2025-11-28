require("dotenv").config();
const path = require("path");
const http = require("http");
const express = require("express");
const jwt = require("jsonwebtoken");
const connectDB = require("./config/db");
const { protect } = require("./middleware/authMiddleware");

connectDB();

const app = express();
const server = http.createServer(app);

function safeRequire(path) {
  try {
    return require(path);
  } catch (e) {
    console.error(`❌ Failed to require ${path}:`, e.message);
    return null;
  }
}

function safeUseRoute(app, mountPath, routerModule) {
  if (typeof routerModule === "function") {
    app.use(mountPath, routerModule);
    console.log(`✅ Mounted route ${mountPath}`);
  } else {
    console.error(
      `⚠️ Skipping route ${mountPath} — not a function. Got:`,
      typeof routerModule
    );
  }
}

const { Server } = require("socket.io");
const io = new Server(server, {
  cors: { origin: [FRONTEND_URL, "http://localhost:5173"], credentials: true }
});
app.set("io", io);

const onlineUsers = new Map();

io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next();
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;
    next();
  } catch {
    next();
  }
});

io.on("connection", socket => {
  const userId = socket.user?.id;
  if (userId) {
    const set = onlineUsers.get(userId) || new Set();
    set.add(socket.id);
    onlineUsers.set(userId, set);
    socket.join(`user:${userId}`);
    io.emit("presence:update", { userId, online: true });
  }

  socket.on("disconnect", () => {
    if (!userId) return;
    const set = onlineUsers.get(userId);
    if (set) {
      set.delete(socket.id);
      if (set.size === 0) {
        onlineUsers.delete(userId);
        io.emit("presence:update", { userId, online: false });
      }
    }
  });
});

function safeMiddleware(name) {
  try {
    return require(name);
  } catch {
    return null;
  }
}

const cors = safeMiddleware("cors");
const helmet = safeMiddleware("helmet");
const morgan = safeMiddleware("morgan");
const compression = safeMiddleware("compression");
const rateLimit = safeMiddleware("express-rate-limit");
const cookieParser = safeMiddleware("cookie-parser");

if (helmet) {
  app.use(
    helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } })
  );
}

if (cors) {
  app.use(
    cors({
      origin: [FRONTEND_URL, "http://localhost:5173"],
      credentials: true
    })
  );
}

if (morgan) {
  app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
}

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

if (cookieParser) app.use(cookieParser());
if (compression) app.use(compression());

if (rateLimit) {
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    standardHeaders: true,
    legacyHeaders: false
  });
  app.use("/api", apiLimiter);
}

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const authRoutes = safeRequire("./routes/authRoutes");
const userRoutes = safeRequire("./routes/userRoutes");
const projectRoutes = safeRequire("./routes/projectRoutes");
const taskRoutes = safeRequire("./routes/taskRoutes");
const roleRoutes = safeRequire("./routes/roleRoutes");
const customerRoutes = safeRequire("./routes/customerRoutes");
const messageRoutes = safeRequire("./routes/messageRoutes");

app.get("/api/health", (req, res) => res.json({ ok: true, ts: Date.now() }));

safeUseRoute(app, "/api/auth", authRoutes);
safeUseRoute(app, "/api/users", userRoutes);
safeUseRoute(app, "/api/projects", projectRoutes);
safeUseRoute(app, "/api/tasks", taskRoutes);
safeUseRoute(app, "/api/roles", roleRoutes);
safeUseRoute(app, "/api/customers", customerRoutes);
safeUseRoute(app, "/api/messages", messageRoutes);

app.get("/api/teams", protect, (req, res) => res.json([]));
app.get("/api/calendar/events", protect, (req, res) => res.json([]));
app.get("/api/analytics", protect, (req, res) => res.json({ summary: [] }));
app.get("/api/notes", protect, (req, res) => res.json([]));
app.get("/api/settings", protect, (req, res) => res.json({ ok: true }));
app.get("/api/support/tickets", protect, (req, res) => res.json([]));

const OpenAI = require("openai");
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post("/api/chat", protect, async (req, res) => {
  const { message, history = [] } = req.body;
  if (!message) {
    return res.status(400).json({ reply: "Message cannot be empty." });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: process.env.MODEL_NAME || "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a multilingual intelligent assistant for a CMS dashboard. " +
            "Detect the user's language and reply in the same language. " +
            "Be concise, friendly, and professional."
        },
        ...history,
        { role: "user", content: message }
      ]
    });

    const reply = completion.choices[0].message.content;
    res.json({ reply });
  } catch (err) {
    console.error("OpenAI error:", err);
    res.status(500).json({
      reply: "⚠️ Error connecting to the AI server. Please try again later."
    });
  }
});

app.all(/^\/api\/.*/, (req, res) => {
  res.status(404).json({ message: "Not Found" });
});

const clientBuild = path.join(__dirname, "..", "cms-frontend", "build");
app.use(express.static(clientBuild));
app.get(/^(?!\/api\/).*/, (req, res) => {
  res.sendFile(path.join(clientBuild, "index.html"));
});

server.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});

process.on("SIGINT", () => process.exit());
process.on("SIGTERM", () => process.exit());
