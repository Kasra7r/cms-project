const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  permissions: [
    { type: String, enum: ['create', 'read', 'update', 'delete'], required: true }
  ], // دسترسی‌هایی که هر نقش دارد (مثلاً "create", "read")
});

module.exports = mongoose.model('Role', roleSchema);
