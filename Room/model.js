const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    roomNumber: {
      type: String,
      required: true,
      unique: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["single", "double", "suite"],
    },
    price: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    images: [String],
  },
  { timestamps: true },
);

module.exports = mongoose.model("Room", roomSchema);
