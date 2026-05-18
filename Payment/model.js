const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    subscription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subscription",
      required: false,
    },
    amount: {
      type: Number,
      required: true,
    },
    amountBeforeCredit: {
      type: Number,
      default: 0,
    },
    creditApplied: {
      type: Number,
      default: 0,
    },
    billingCycle: {
      type: String,
      enum: ["monthly", "quarterly", "annual"],
      default: "monthly",
    },
    discountPercent: {
      type: Number,
      default: 0,
    },
    monthsCovered: {
      type: Number,
      default: 1,
    },
    billingPeriodStart: {
      type: Date,
      required: true,
    },
    billingPeriodEnd: {
      type: Date,
      required: true,
    },
    method: {
      type: String,
      enum: ["cash", "card", "online"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Payment", paymentSchema);
