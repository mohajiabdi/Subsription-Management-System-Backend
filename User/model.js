const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: false,
      unique: true,
      sparse: true, // allows multiple nulls with unique index
    },
    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["admin", "customer", "agent"],
      default: "customer",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

// Geospatial index for nearby fuel station queries
userSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("User", userSchema);
