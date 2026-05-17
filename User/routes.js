const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/authenticate");
const {
  register,
  login,
  getProfile,
  updateProfile,
  updateLocation,
  changePassword,
  deactivateAccount,
} = require("./controllers");

// ─── Public ───────────────────────────────────────────────────────────────────
router.post("/register", register);
router.post("/login", login);

// ─── Protected (requires valid user token) ────────────────────────────────────
router.get("/profile", authenticate(), getProfile);
router.patch("/profile", authenticate(), updateProfile);
router.patch("/change-password", authenticate(), changePassword);

module.exports = router;
