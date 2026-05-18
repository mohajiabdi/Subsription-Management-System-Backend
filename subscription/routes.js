// subscription/routes.js

const express = require("express");

const router = express.Router();
const authenticate = require("../middleware/authenticate");

const {
  getSubscriptions,
  createSubscription,
  updateSubscription,
  deleteSubscription,
} = require("./controller");

router.get("/", authenticate("admin", "agent", "customer"), getSubscriptions);

router.post("/", authenticate("admin"), createSubscription);

router.put("/:id", authenticate("admin"), updateSubscription);
router.patch("/:id", authenticate("admin"), updateSubscription);

router.delete("/:id", authenticate("admin"), deleteSubscription);

module.exports = router;
