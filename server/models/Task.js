const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ["personal", "work", "other"],
      required: true,
      default: "other",
    },
    dueDate: {
      type: Date,
      required: false, // Changed to false so it's optional!
    },
    extraDetails: {
      type: String,
      trim: true,
      default: "", // New field for extra notes/scratchpad details
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Task", taskSchema);
