// controllers/messagesController.js
const mongoose = require('mongoose');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

exports.listConversations = async (req, res) => {
  try {
    const userId = req.user.id;

    const conversations = await Conversation.find({ participants: userId })
      .sort({ updatedAt: -1 })
      .populate('participants', 'id username email avatar');

    const convoIds = conversations.map((c) => c._id);
    const lastMessages = await Message.aggregate([
      { $match: { conversation: { $in: convoIds } } },
      { $sort: { createdAt: -1 } },
      { $group: { _id: '$conversation', lastMessage: { $first: '$$ROOT' } } },
    ]);

    const lastMap = {};
    lastMessages.forEach((lm) => (lastMap[lm._id.toString()] = lm.lastMessage));

    const result = conversations.map((c) => {
      const json = c.toJSON();
      json.lastMessage = lastMap[c._id.toString()] || null;
      return json;
    });

    res.json(result);
  } catch (err) {
    console.error('listConversations error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.listMessages = async (req, res) => {
  try {
    const { id } = req.params;      // conversation id
    const userId = req.user.id;

    const convo = await Conversation.findById(id);
    if (!convo) return res.status(404).json({ message: 'Conversation not found' });

    const isMember = (convo.participants || []).some((p) => p.toString() === userId);
    if (!isMember) return res.status(403).json({ message: 'Not allowed' });

    // پیام‌ها را بیاور
    const messages = await Message.find({ conversation: id })
      .sort({ createdAt: 1 })
      .populate('from', 'id username email avatar')
      .populate('to', 'id username email avatar');

    // تحویل‌خورده (delivered) کردن همهٔ پیام‌هایی که مال کاربر جاری نیست و هنوز deliveredTo شامل او نیست
    const notMineIds = messages
      .filter((m) => m.from?.toString?.() !== userId && !(m.deliveredTo || []).map(String).includes(userId))
      .map((m) => m._id);

    if (notMineIds.length) {
      await Message.updateMany(
        { _id: { $in: notMineIds } },
        { $addToSet: { deliveredTo: userId } }
      );

      const io = req.app.get('io');
      if (io) {
        io.to(id).emit('message:delivered', { conversationId: id, by: userId, messageIds: notMineIds.map(String) });
      }
    }

    res.json(messages);
  } catch (err) {
    console.error('listMessages error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { id } = req.params; // conversation id
    const { text, to = [] } = req.body;
    const userId = req.user.id;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Message text is required' });
    }

    const convo = await Conversation.findById(id);
    if (!convo) return res.status(404).json({ message: 'Conversation not found' });

    const isMember = (convo.participants || []).some((p) => p.toString() === userId);
    if (!isMember) return res.status(403).json({ message: 'Not allowed' });

    const msg = await Message.create({
      conversation: id,
      from: userId,
      to,
      text: text.trim(),
    });

    await Conversation.findByIdAndUpdate(id, { updatedAt: new Date() });

    const io = req.app.get('io');
    if (io) {
      // پیام جدید برای همهٔ اعضای اتاق
      io.to(id).emit('message:new', {
        id: msg.id,
        conversation: id,
        from: userId,
        to,
        text: msg.text,
        createdAt: msg.createdAt,
      });

      // برای فرستنده، وضعیت «sent»/«delivered-to-self» (تجربه بهتر UI)
      io.to(id).emit('message:delivered', { conversationId: id, by: userId, messageIds: [msg.id] });
    }

    res.json(msg);
  } catch (err) {
    console.error('sendMessage error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// مارک‌کردن همهٔ پیام‌های یک گفتگو به‌عنوان خوانده‌شده توسط کاربر جاری
// POST /api/messages/conversations/:id/read
exports.markReadConversation = async (req, res) => {
  try {
    const { id } = req.params; // conversation id
    const userId = req.user.id;

    const convo = await Conversation.findById(id);
    if (!convo) return res.status(404).json({ message: 'Conversation not found' });

    const isMember = (convo.participants || []).some((p) => p.toString() === userId);
    if (!isMember) return res.status(403).json({ message: 'Not allowed' });

    const result = await Message.updateMany(
      { conversation: id, from: { $ne: userId }, readBy: { $ne: userId } },
      { $addToSet: { readBy: userId } }
    );

    const io = req.app.get('io');
    if (io) {
      io.to(id).emit('message:read', { conversationId: id, by: userId, all: true });
    }

    res.json({ ok: true, modified: result.modifiedCount });
  } catch (err) {
    console.error('markReadConversation error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// مارک‌کردن یک پیام خاص به‌عنوان خوانده‌شده (در صورت نیاز)
exports.markReadOne = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    const msg = await Message.findById(messageId);
    if (!msg) return res.status(404).json({ message: 'Message not found' });

    const convo = await Conversation.findById(msg.conversation);
    const isMember = (convo.participants || []).some((p) => p.toString() === userId);
    if (!isMember) return res.status(403).json({ message: 'Not allowed' });

    if (!(msg.readBy || []).map(String).includes(userId)) {
      msg.readBy.push(userId);
      await msg.save();

      const io = req.app.get('io');
      if (io) {
        io.to(String(msg.conversation)).emit('message:read', {
          conversationId: String(msg.conversation),
          by: userId,
          messageId: msg.id,
        });
      }
    }

    res.json({ ok: true });
  } catch (err) {
    console.error('markReadOne error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
