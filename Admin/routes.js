const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/authenticate");
const {
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
} = require("./controllers");

// User management routes
router.get("/users", authenticate("admin", "agent"), listUsers);
router.get("/customers", authenticate("admin", "agent"), listCustomers);
router.post("/users", authenticate("admin", "agent"), createUser);
router.patch("/users/:id", authenticate("admin"), updateUser);
router.delete("/users/:id", authenticate("admin"), deleteUser);
router.patch("/users/:id/password", authenticate("admin"), changeUserPassword);

// Dashboard and statistics
router.get("/dashboard-stats", authenticate("admin", "agent"), getDashboardStats);
router.get("/subscriptions", authenticate("admin"), getSubscriptionDetails);

// Role management
router.post("/manage-role", authenticate("admin"), manageUserRole);

// Admin activities/audit logs
router.get("/activities", authenticate("admin"), getAdminActivities);

module.exports = router;
