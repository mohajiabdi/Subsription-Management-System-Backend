const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    billingCycle: {
      type: String,
      enum: ["monthly", "quarterly", "annual"],
      default: "monthly",
    },

    price: {
      type: Number,
      required: true,
      default: 0,
    },

    duration: {
      type: Number,
      default: 30,
    },

    maxUsers: {
      type: Number,
      default: 1,
    },

    status: {
      type: String,
      enum: ["active", "inactive", "pending"],
      default: "active",
    },

    description: {
      type: String,
      default: "",
    },

    features: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Subscription", subscriptionSchema);
