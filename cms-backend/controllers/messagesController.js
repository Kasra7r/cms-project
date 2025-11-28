const mongoose = require("mongoose");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");

// list all conversations for the current user + last message per conversation
exports.listConversations = async (req, res) => {
  try {
    const userId = req.user.id;

    const conversations = await Conversation.find({ participants: userId })
      .sort({ updatedAt: -1 })
      .populate("participants", "id username email avatar");

    const convoIds = conversations.map(c => c._id);

    const lastMessages = await Message.aggregate([
      { $match: { conversation: { $in: convoIds } } },
      { $sort: { createdAt: -1 } },
      // pick the newest message per conversation
      { $group: { _id: "$conversation", lastMessage: { $first: "$$ROOT" } } },
    ]);

    const lastMap = {};
    lastMessages.forEach(lm => {
      lastMap[lm._id.toString()] = lm.lastMessage;
    });

    const result = conversations.map(c => {
      const json = c.toJSON();
      json.lastMessage = lastMap[c._id.toString()] || null;
      return json;
    });

    res.json(result);
  } catch (err) {
    console.error("listConversations error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// fetch messages for a single conversation (with basic access check)
exports.listMessages = async (req, res) => {
  try {
    const { id } = req.params; // conversation id
    const userId = req.user.id;

    const convo = await Conversation.findById(id);
    if (!convo) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    const isMember = (convo.participants || []).some(
      p => p.toString() === userId
    );
    if (!isMember) {
      return res.status(403).json({ message: "Not allowed" });
    }

    const messages = await Message.find({ conversation: id })
      .sort({ createdAt: 1 })
      .populate("from", "id username email avatar")
      .populate("to", "id username email avatar");

    // mark as delivered for messages that aren't from the current user
    const notMineIds = messages
      .filter(
        m =>
          m.from?.toString?.() !== userId &&
          !(m.deliveredTo || []).map(String).includes(userId)
      )
      .map(m => m._id);

    if (notMineIds.length) {
      await Message.updateMany(
        { _id: { $in: notMineIds } },
        { $addToSet: { deliveredTo: userId } }
      );

      const io = req.app.get("io");
      if (io) {
        io.to(id).emit("message:delivered", {
          conversationId: id,
          by: userId,
          messageIds: notMineIds.map(String),
        });
      }
    }

    res.json(messages);
  } catch (err) {
    console.error("listMessages error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// send a new message inside an existing conversation
exports.sendMessage = async (req, res) => {
  try {
    const { id } = req.params; // conversation id
    const { text, to = [] } = req.body;
    const userId = req.user.id;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Message text is required" });
    }

    const convo = await Conversation.findById(id);
    if (!convo) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    const isMember = (convo.participants || []).some(
      p => p.toString() === userId
    );
    if (!isMember) {
      return res.status(403).json({ message: "Not allowed" });
    }

    const msg = await Message.create({
      conversation: id,
      from: userId,
      to,
      text: text.trim(),
    });

    // bump updatedAt so this conversation stays on top of the list
    await Conversation.findByIdAndUpdate(id, { updatedAt: new Date() });

    const io = req.app.get("io");
    if (io) {
      io.to(id).emit("message:new", {
        id: msg.id,
        conversation: id,
        from: userId,
        to,
        text: msg.text,
        createdAt: msg.createdAt,
      });

      // mark as delivered for the sender (nicer UX on the client)
      io.to(id).emit("message:delivered", {
        conversationId: id,
        by: userId,
        messageIds: [msg.id],
      });
    }

    res.json(msg);
  } catch (err) {
    console.error("sendMessage error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// mark all messages in a conversation as read by the current user
exports.markReadConversation = async (req, res) => {
  try {
    const { id } = req.params; // conversation id
    const userId = req.user.id;

    const convo = await Conversation.findById(id);
    if (!convo) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    const isMember = (convo.participants || []).some(
      p => p.toString() === userId
    );
    if (!isMember) {
      return res.status(403).json({ message: "Not allowed" });
    }

    const result = await Message.updateMany(
      { conversation: id, from: { $ne: userId }, readBy: { $ne: userId } },
      { $addToSet: { readBy: userId } }
    );

    const io = req.app.get("io");
    if (io) {
      io.to(id).emit("message:read", {
        conversationId: id,
        by: userId,
        all: true,
      });
    }

    res.json({ ok: true, modified: result.modifiedCount });
  } catch (err) {
    console.error("markReadConversation error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// mark a single message as read (if needed)
exports.markReadOne = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    const msg = await Message.findById(messageId);
    if (!msg) {
      return res.status(404).json({ message: "Message not found" });
    }

    const convo = await Conversation.findById(msg.conversation);
    if (!convo) {
      // small safety check in case the conversation was removed
      return res.status(404).json({ message: "Conversation not found" });
    }

    const isMember = (convo.participants || []).some(
      p => p.toString() === userId
    );
    if (!isMember) {
      return res.status(403).json({ message: "Not allowed" });
    }

    const alreadyRead = (msg.readBy || []).map(String).includes(userId);

    if (!alreadyRead) {
      msg.readBy.push(userId);
      await msg.save();

      const io = req.app.get("io");
      if (io) {
        io.to(String(msg.conversation)).emit("message:read", {
          conversationId: String(msg.conversation),
          by: userId,
          messageId: msg.id,
        });
      }
    }

    res.json({ ok: true });
  } catch (err) {
    console.error("markReadOne error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
