const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
      // create subscription folder and then fix the frontend to work with the subscription management system and then add the crud for the subscription management system and then add the role based access control for the subscription management system and then add the admin panel for the subscription management system and then add the user management for the subscription management system and then add the role assignment for the subscription management system and then add the frontend for the subscription management system and then fix all the errors in the frontend and then make sure everything works well with the frontend and then test all the features of the subscription management system and then deploy it to production
    },
    endDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "pending",
    },
    totalAmount: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Booking", bookingSchema);
