// subscription/routes.js

const express = require("express");

const router = express.Router();

const {
  getSubscriptions,
  createSubscription,
  updateSubscription,
  deleteSubscription,
} = require("./controller");

router.get("/", getSubscriptions);

router.post("/", createSubscription);

router.put("/:id", updateSubscription);

router.delete("/:id", deleteSubscription);

module.exports = router;
