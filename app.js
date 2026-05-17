const express = require("express");
const userRoutes = require("./User/routes.js");
const roomRoutes = require("./Room/routes.js");
const adminRoutes = require("./Admin/routes.js");
const bookingRoutes = require("./Booking/routes.js");
const paymentRoutes = require("./Payment/routes.js");
const subscriptionRoutes = require("./Subscription/Routes.js");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1/user", userRoutes);
app.use("/api/v1/rooms", roomRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/bookings", bookingRoutes);
app.use("/api/v1/payments", paymentRoutes);
app.use("/api/v1/subscriptions", subscriptionRoutes);

app.get("/api/v1/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Service is running",
  });
});

module.exports = app;
