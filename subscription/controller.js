// subscription/controller.js

const Subscription = require("./model");

// GET ALL
exports.getSubscriptions = async (req, res) => {
  try {
    const subscriptions = await Subscription.find().sort({
      price: 1,
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      data: subscriptions,
    });
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
    const payload = {
      name: req.body.name,
      billingCycle: "monthly",
      price: req.body.price,
      duration: 30,
      maxUsers: req.body.maxUsers,
      status: req.body.status,
      description: req.body.description,
      features: req.body.features,
    };

    const subscription = await Subscription.create(payload);

    res.status(201).json({
      success: true,
      message: "Subscription created successfully",
      data: subscription,
    });
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
    const payload = {
      ...req.body,
      billingCycle: "monthly",
      duration: 30,
    };

    const subscription = await Subscription.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    });

    if (!subscription) {
      return res.status(404).json({
        message: "Subscription not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Subscription updated successfully",
      data: subscription,
    });
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
      success: true,
      message: "Subscription deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete subscription",
      error: error.message,
    });
  }
};
