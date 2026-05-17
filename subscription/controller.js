// subscription/controller.js

const Subscription = require("./model");

// GET ALL
exports.getSubscriptions = async (req, res) => {
  try {
    const subscriptions = await Subscription.find().sort({
      createdAt: -1,
    });

    res.status(200).json(subscriptions);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch subscriptions",
      error: error.message,
    });
  }
};

// CREATE
exports.createSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.create(req.body);

    res.status(201).json([subscription]);
  } catch (error) {
    res.status(500).json({
      message: "Failed to create subscription",
      error: error.message,
    });
  }
};

// UPDATE
exports.updateSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
      },
    );

    if (!subscription) {
      return res.status(404).json({
        message: "Subscription not found",
      });
    }

    res.status(200).json([subscription]);
  } catch (error) {
    res.status(500).json({
      message: "Failed to update subscription",
      error: error.message,
    });
  }
};

// DELETE
exports.deleteSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findByIdAndDelete(req.params.id);

    if (!subscription) {
      return res.status(404).json({
        message: "Subscription not found",
      });
    }

    res.status(200).json({
      message: "Subscription deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete subscription",
      error: error.message,
    });
  }
};
