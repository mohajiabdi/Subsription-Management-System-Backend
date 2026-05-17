const Payment = require("./model");

const createPayment = async (req, res) => {
  try {
    const { customer, booking, amount, method, status } = req.body;
    const customerId = req.user.role === "customer" ? req.user.id : customer;

    const payment = await Payment.create({
      customer: customerId,
      booking,
      amount,
      method,
      status,
    });

    return res.status(201).json({
      success: true,
      message: "Payment recorded successfully",
      data: payment,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to record payment",
      error: error.message,
    });
  }
};

const getPayments = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === "customer") {
      query.customer = req.user.id;
    }

    const payments = await Payment.find(query)
      .populate("customer", "fullName email")
      .populate("subscription");
    return res.status(200).json({
      success: true,
      data: payments,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch payments",
      error: error.message,
    });
  }
};

const updatePayment = async (req, res) => {
  try {
    const payment = await Payment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!payment) {
      return res
        .status(404)
        .json({ success: false, message: "Payment not found" });
    }
    return res.status(200).json({
      success: true,
      message: "Payment updated successfully",
      data: payment,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update payment",
      error: error.message,
    });
  }
};

module.exports = {
  createPayment,
  getPayments,
  updatePayment,
};
