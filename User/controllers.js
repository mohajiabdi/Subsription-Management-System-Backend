const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("./model");

// ─── Register ────────────────────────────────────────────────────────────────

const register = async (req, res) => {
  try {
    const { fullName, email, phone, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "fullName, email, and password are required",
      });
    }

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
      phone: phone || undefined,
      password: hashedPassword,
    });

    const { password: _, ...userData } = user.toObject();

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: userData,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Registration failed",
      error: error.message,
    });
  }
};

// ─── Login ───────────────────────────────────────────────────────────────────

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Account is deactivated",
      });
    }
    // save the role of the user
    req.user = { id: user._id, role: user.role };

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    const { password: _, ...userData } = user.toObject();

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      data: userData,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Login failed",
      error: error.message,
    });
  }
};

// ─── Get Profile ─────────────────────────────────────────────────────────────

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // get the role of the user from the token and add it to the response
    user.role = req.user.role;

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch profile",
      error: error.message,
    });
  }
};
// ─── Update Profile ───────────────────────────────────────────────────────────

const updateProfile = async (req, res) => {
  try {
    const { fullName, phone } = req.body;

    const updated = await User.findByIdAndUpdate(
      req.user.id,
      { fullName, phone },
      { new: true, runValidators: true },
    ).select("-password");

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    // fix the error of the fronend only i dont see anything on the screen only white screen
    return res.status(200).json({
      success: true,
      message: "Profile updated",
      data: updated,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Update failed",
      error: error.message,
    });
  }
};

// ─── Update Location ──────────────────────────────────────────────────────────

const updateLocation = async (req, res) => {
  try {
    const { longitude, latitude } = req.body;

    if (longitude === undefined || latitude === undefined) {
      return res.status(400).json({
        success: false,
        message: "longitude and latitude are required",
      });
    }

    const updated = await User.findByIdAndUpdate(
      req.user.id,
      {
        location: {
          type: "Point",
          coordinates: [longitude, latitude],
        },
      },
      { new: true },
    ).select("-password");

    return res.status(200).json({
      success: true,
      message: "Location updated",
      data: updated,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update location",
      error: error.message,
    });
  }
};

// ─── Change Password ──────────────────────────────────────────────────────────

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "currentPassword and newPassword are required",
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to change password",
      error: error.message,
    });
  }
};
//   make the crud operation work well if the uer is admin should be able to do all of it and this one is another system for subscription based and customer can create and read while agent should be to create and read too and only should be able to do all of it  make sure everythign works well with front end use yur design logic and base on the backend
//admi should be able to assing roles and contorl the system  in the front end take th backend and make it work with it the name subscription managment system
// ─── Deactivate Account ───────────────────────────────────────────────────────

const deactivateAccount = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { isActive: false });

    return res.status(200).json({
      success: true,
      message: "Account deactivated",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to deactivate account",
      error: error.message,
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  updateLocation,
  changePassword,
  deactivateAccount,
};
