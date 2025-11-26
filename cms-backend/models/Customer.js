// models/Customer.js
const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    phone: String,
    address: String,
    company: String,
  },
  { timestamps: true, versionKey: false, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

customerSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

customerSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret._id;
    return ret;
  },
});

module.exports = mongoose.model('Customer', customerSchema);
