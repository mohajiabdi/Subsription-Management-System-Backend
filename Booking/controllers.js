const Booking = require("./model");

const createBooking = async (req, res) => {
  try {
    const { customer, room, startDate, endDate, totalAmount } = req.body;
    
    // For customers, ensure they only create for themselves
    const customerId = req.user.role === 'customer' ? req.user.id : customer;

    const booking = await Booking.create({
      customer: customerId,
      room,
      startDate,
      endDate,
      totalAmount,
    });

    return res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: booking,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create booking",
      error: error.message,
    });
  }
};

const getBookings = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === "customer") {
      query.customer = req.user.id;
    }

    const bookings = await Booking.find(query).populate("customer", "fullName email").populate("room");
    return res.status(200).json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch bookings",
      error: error.message,
    });
  }
};

const getBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate("customer", "fullName email").populate("room");
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    if (req.user.role === "customer" && booking.customer._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    return res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch booking",
      error: error.message,
    });
  }
};

const updateBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Booking updated successfully",
      data: booking,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update booking",
      error: error.message,
    });
  }
};

const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }
    return res.status(200).json({
      success: true,
      message: "Booking deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete booking",
      error: error.message,
    });
  }
};

module.exports = {
  createBooking,
  getBookings,
  getBooking,
  updateBooking,
  deleteBooking,
};
