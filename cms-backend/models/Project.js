const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    owner: { type: String, trim: true },
    description: { type: String, trim: true },
    status: {
      type: String,
      enum: ["Planned", "In Progress", "Completed", "On Hold"],
      default: "Planned",
    },
    startDate: { type: Date },
    dueDate: { type: Date },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

projectSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

projectSchema.set("toJSON", {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret._id;
    return ret;
  },
});

module.exports = mongoose.model("Project", projectSchema);
