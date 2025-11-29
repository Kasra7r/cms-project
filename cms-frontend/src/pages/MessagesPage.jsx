import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import {
  Avatar,
  Box,
  Button,
  Divider,
  IconButton,
  LinearProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import RefreshIcon from "@mui/icons-material/Refresh";
import DoneIcon from "@mui/icons-material/Done";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import { io } from "socket.io-client";
import { useTranslation } from "react-i18next";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

function getAuthHeaders() {
  const t =
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    sessionStorage.getItem("token");
  return t ? { Authorization: `Bearer ${t}` } : {};
}
function getUserIdFromToken() {
  try {
    const t =
      localStorage.getItem("token") ||
      localStorage.getItem("authToken") ||
      sessionStorage.getItem("token");
    if (!t) return null;
    const payload = JSON.parse(atob(t.split(".")[1]));
    return payload.id || payload._id || null;
  } catch {
    return null;
  }
}

export default function MessagesPage() {
  const { t } = useTranslation("common");
  const meId = getUserIdFromToken();
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [sending, setSending] = useState(false);
  const [text, setText] = useState("");
  const [typingUsers, setTypingUsers] = useState(new Map());
  const [presence, setPresence] = useState(new Map());
  const listRef = useRef(null);
  const typingTimerRef = useRef(null);
  const socketRef = useRef(null);

  const api = useMemo(
    () => axios.create({ baseURL: API_URL, headers: { ...getAuthHeaders() } }),
    []
  );

  async function fetchConversations() {
    setLoading(true);
    try {
      const { data } = await api.get("/api/messages/conversations");
      const items = data?.items || data || [];
      setConversations(items);
      if (!activeId && items[0]?.id) setActiveId(items[0].id);
    } finally {
      setLoading(false);
    }
  }

  async function fetchMessages(convId) {
    if (!convId) return;
    const { data } = await api.get(
      `/api/messages/conversations/${convId}/messages?limit=100`
    );
    const items = data?.items || data || [];
    setMessages(items);
    setTimeout(() => {
      const el = listRef.current;
      if (el) el.scrollTop = el.scrollHeight;
    }, 0);
    try {
      await api.post(`/api/messages/conversations/${convId}/read`);
    } catch {}
  }

  useEffect(() => {
    fetchConversations();
    const token = getAuthHeaders().Authorization?.split(" ")?.[1] || undefined;
    socketRef.current = io(API_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
    });
    socketRef.current.on("connect", () => {
      if (activeId)
        socketRef.current.emit("conversation:join", {
          conversationId: activeId,
        });
    });
    socketRef.current.on("message:new", (msg) => {
      if (msg?.conversation === activeId) {
        setMessages((m) => [...m, msg]);
        setTimeout(() => {
          const el = listRef.current;
          if (el) el.scrollTop = el.scrollHeight;
        }, 0);
      }
    });
    socketRef.current.on("presence:update", ({ userId, online }) => {
      setPresence((p) => {
        const m = new Map(p);
        m.set(userId, !!online);
        return m;
      });
    });
    return () => socketRef.current?.disconnect();
  }, []);

  useEffect(() => {
    if (!activeId) return;
    fetchMessages(activeId);
    socketRef.current?.emit("conversation:join", { conversationId: activeId });
  }, [activeId]);

  async function handleSend(e) {
    e?.preventDefault?.();
    const body = text.trim();
    if (!body || !activeId) return;
    setSending(true);
    try {
      const { data } = await api.post(
        `/api/messages/conversations/${activeId}/messages`,
        { text: body }
      );
      setMessages((m) => [...m, data]);
      setText("");
      setTimeout(() => {
        const el = listRef.current;
        if (el) el.scrollTop = el.scrollHeight;
      }, 0);
    } finally {
      setSending(false);
    }
  }

  function StatusIcon({ status }) {
    if (status === "read")
      return (
        <DoneAllIcon sx={{ fontSize: 16, color: "#42a5f5" }} />
      );
    if (status === "delivered")
      return <DoneAllIcon sx={{ fontSize: 16, opacity: 0.7 }} />;
    if (status === "sent")
      return <DoneIcon sx={{ fontSize: 16, opacity: 0.7 }} />;
    return null;
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>
        {t("pages.messages.title")}
      </Typography>
      {loading && <LinearProgress sx={{ mb: 2 }} />}

      <Stack direction="row" spacing={2}>
        <Paper
          sx={{
            width: 320,
            flexShrink: 0,
            p: 1,
            height: "70vh",
            overflow: "auto",
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            sx={{ px: 1, pb: 1 }}
            spacing={1}
          >
            <Typography sx={{ fontWeight: 700 }}>
              {t("messages.conversations")}
            </Typography>
            <IconButton
              size="small"
              onClick={fetchConversations}
              sx={{ ml: "auto" }}
            >
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Stack>
          <Divider />
          <List dense>
            {conversations.map((c) => {
              const display =
                c.title ||
                c.participants
                  ?.map(
                    (p) => p?.name || p?.username || p?.email
                  )
                  ?.join(", ") ||
                t("messages.chat", "Chat");
              const lastText = c.lastMessage?.text || "—";
              return (
                <ListItem
                  key={c.id}
                  button
                  selected={activeId === c.id}
                  onClick={() => setActiveId(c.id)}
                >
                  <ListItemAvatar>
                    <Avatar>
                      {display?.[0]?.toUpperCase() || "C"}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText primary={display} secondary={lastText} />
                </ListItem>
              );
            })}
          </List>
        </Paper>
        <Paper
          sx={{
            flex: 1,
            p: 2,
            height: "70vh",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box ref={listRef} sx={{ flex: 1, overflow: "auto" }}>
            {messages.map((m) => {
              const id = m._id || m.id;
              const mine = (m.from?.id || m.from) === meId;
              return (
                <Stack
                  key={id}
                  alignItems={mine ? "flex-end" : "flex-start"}
                  sx={{ mb: 1 }}
                >
                  <Paper sx={{ p: 1, maxWidth: "70%" }}>
                    <Typography variant="body2">{m.text}</Typography>
                  </Paper>
                </Stack>
              );
            })}
          </Box>
          <Divider sx={{ my: 1 }} />
          <Stack
            direction="row"
            spacing={1}
            component="form"
            onSubmit={handleSend}
          >
            <TextField
              value={text}
              onChange={(e) => setText(e.target.value)}
              fullWidth
              placeholder={t(
                "messages.placeholder",
                "Type a message..."
              )}
              size="small"
            />
            <Button
              type="submit"
              variant="contained"
              endIcon={<SendIcon />}
              disabled={sending}
            >
              {t("chat.send")}
            </Button>
          </Stack>
        </Paper>
      </Stack>
    </Box>
  );
}
