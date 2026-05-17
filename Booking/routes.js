const express = require("express");
const {
  createBooking,
  getBookings,
  getBooking,
  updateBooking,
  deleteBooking,
} = require("./controllers");
const authenticate = require("../middleware/authenticate");

const router = express.Router();

router
  .route("/")
  .get(authenticate("admin", "receptionist", "customer"), getBookings)
  .post(authenticate("admin", "receptionist", "customer"), createBooking);

router
  .route("/:id")
  .get(authenticate("admin", "receptionist", "customer"), getBooking)
  .put(authenticate("admin", "receptionist"), updateBooking)
  .delete(authenticate("admin", "receptionist"), deleteBooking);

module.exports = router;
