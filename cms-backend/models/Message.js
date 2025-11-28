const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true
    },
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    to: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],
    text: {
      type: String,
      required: true,
      trim: true
    },
    deliveredTo: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],
    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ]
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

messageSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

messageSchema.set("toJSON", {
  virtuals: true,
  transform: (_, ret) => {
    delete ret._id;
    return ret;
  }
});

module.exports = mongoose.model("Message", messageSchema);
