const User = require("../User/model");
const bcrypt = require("bcryptjs");

const listUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    return res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch users",
      error: error.message,
    });
  }
};

const listCustomers = async (req, res) => {
  try {
    const customers = await User.find({ role: "customer" }).select("-password");
    return res.status(200).json({
      success: true,
      data: customers,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch customers",
      error: error.message,
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete user",
      error: error.message,
    });
  }
};

const createUser = async (req, res) => {
  try {
    const { fullName, email, password, role, phone, isApproved, isActive } =
      req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "fullName, email, and password are required",
      });
    }

    const nextRole = req.user.role === "agent" ? "customer" : role || "customer";

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already in use",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      fullName,
      email,
      password: hashedPassword,
      role: nextRole,
      phone,
      isApproved: isApproved ?? true,
      isActive: isActive ?? true,
    });

    const { password: _, ...userData } = user.toObject();

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      data: userData,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create user",
      error: error.message,
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const { fullName, email, phone, isApproved, isActive, role } = req.body;
    const payload = {};

    if (fullName !== undefined) payload.fullName = fullName;
    if (email !== undefined) payload.email = email;
    if (phone !== undefined) payload.phone = phone || undefined;
    if (isApproved !== undefined) payload.isApproved = isApproved;
    if (isActive !== undefined) payload.isActive = isActive;
    if (role !== undefined) payload.role = role;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      payload,
      { new: true, runValidators: true },
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update user",
      error: error.message,
    });
  }
};

const changeUserPassword = async (req, res) => {
  try {
    const { password, confirmPassword } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password is required",
      });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { password: hashedPassword },
      { new: true },
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update password",
      error: error.message,
    });
  }
};

// Admin dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    const User = require("../User/model");
    const Subscription = require("../Subscription/model.js");
    const Payment = require("../Payment/model.js");

    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const totalSubscriptions = await Subscription.countDocuments();
    const activeSubscriptionPlans = await Subscription.countDocuments({
      status: "active",
    });
    const totalSubscribedUsers = await Payment.distinct("customer", {
      status: "completed",
    });
    const totalRevenue =
      req.user.role === "admin"
        ? await Payment.aggregate([
            {
              $match: { status: "completed" },
            },
            {
              $group: {
                _id: null,
                total: { $sum: "$amount" },
              },
            },
          ])
        : [];

    res.status(200).json({
      success: true,
      message: "Dashboard statistics retrieved successfully",
      data: {
        users: {
          total: totalUsers,
          active: activeUsers,
        },
        subscriptions: {
          total: totalSubscriptions,
          activePlans: activeSubscriptionPlans,
          subscribedUsers: totalSubscribedUsers.length,
        },
        revenue:
          req.user.role === "admin"
            ? {
                total: totalRevenue[0]?.total || 0,
              }
            : undefined,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving dashboard statistics",
      error: error.message,
    });
  }
};

// Get subscription details for admin
const getSubscriptionDetails = async (req, res) => {
  try {
    const Subscription = require("../Subscription/model.js");
    const { skip = 0, limit = 10 } = req.query;

    const subscriptions = await Subscription.find()
      .populate("createdBy", "fullName email")
      .populate("updatedBy", "fullName email")
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Subscription.countDocuments();

    res.status(200).json({
      success: true,
      message: "Subscriptions retrieved successfully",
      data: subscriptions,
      pagination: {
        total,
        skip: parseInt(skip),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving subscriptions",
      error: error.message,
    });
  }
};

// Manage user roles and permissions
const manageUserRole = async (req, res) => {
  try {
    const { userId, role } = req.body;
    const RoleAssignment = require("../Subscription/roleAssignment.model.js");

    if (!userId || !role) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: userId, role",
      });
    }

    // Check valid roles
    const validRoles = ["admin", "agent", "customer"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Deactivate previous roles
    await RoleAssignment.updateMany(
      { userId, isActive: true },
      { isActive: false },
    );

    const roleAssignment = new RoleAssignment({
      userId,
      role,
      assignedBy: req.user.id,
    });

    await roleAssignment.save();

    // Update user model
    user.role = role;
    await user.save();

    res.status(200).json({
      success: true,
      message: "User role updated successfully",
      data: roleAssignment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating user role",
      error: error.message,
    });
  }
};

// Get audit logs or admin activities
const getAdminActivities = async (req, res) => {
  try {
    // This would typically query a separate audit log collection
    // For now, we'll return recent admin-related activities
    res.status(200).json({
      success: true,
      message: "Admin activities retrieved successfully",
      data: [],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving admin activities",
      error: error.message,
    });
  }
};

module.exports = {
  listUsers,
  listCustomers,
  createUser,
  updateUser,
  deleteUser,
  changeUserPassword,
  getDashboardStats,
  getSubscriptionDetails,
  manageUserRole,
  getAdminActivities,
};
