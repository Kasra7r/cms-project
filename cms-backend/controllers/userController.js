// controllers/userController.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const toSafeUser = (userDoc) => {
  const u = userDoc.toObject({ virtuals: true });
  delete u.password;
  // نقش‌ها را به نام تبدیل می‌کنیم تا فرانت ساده‌تر باشد
  u.roleNames = (u.roles || []).map(r => (typeof r === 'string' ? r : r?.name)).filter(Boolean);
  return u;
};

// GET profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('roles', 'name');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(toSafeUser(user));
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

// UPDATE profile
const updateProfile = async (req, res) => {
  const { username, firstName, lastName, email, birthDate } = req.body;
  try {
    const user = await User.findById(req.user.id).populate('roles', 'name');
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.username = username ?? user.username;
    user.firstName = firstName ?? user.firstName;
    user.lastName = lastName ?? user.lastName;
    user.email = email ?? user.email;
    user.birthDate = birthDate ?? user.birthDate;

    await user.save();
    res.json({ message: 'Profile updated', user: toSafeUser(user) });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

// UPLOAD avatar
const uploadAvatar = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.avatar) {
      const oldPath = path.join(__dirname, '..', 'uploads', user.avatar);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    user.avatar = req.file.filename;
    await user.save();
    res.json({ message: 'Avatar uploaded', avatar: user.avatar });
  } catch {
    res.status(500).json({ message: 'Error uploading avatar' });
  }
};

// DELETE avatar
const deleteAvatar = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.avatar) {
      const oldPath = path.join(__dirname, '..', 'uploads', user.avatar);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      user.avatar = '';
      await user.save();
    }

    res.json({ message: 'Avatar deleted' });
  } catch {
    res.status(500).json({ message: 'Error deleting avatar' });
  }
};

// CHANGE password
const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Incorrect current password' });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getProfile, updateProfile, uploadAvatar, deleteAvatar, changePassword };
