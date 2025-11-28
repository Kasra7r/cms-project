const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true }
    ],
    title: String,
    isGroup: { type: Boolean, default: false }
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

conversationSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

conversationSchema.set("toJSON", {
  virtuals: true,
  transform: (_, ret) => {
    delete ret._id;
    return ret;
  }
});

module.exports = mongoose.model("Conversation", conversationSchema);
