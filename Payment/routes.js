const express = require("express");
const {
  createPayment,
  getPayments,
  updatePayment,
} = require("./controllers");
const authenticate = require("../middleware/authenticate");

const router = express.Router();

router
  .route("/")
  .get(authenticate("admin", "receptionist", "customer"), getPayments)
  .post(authenticate("admin", "customer"), createPayment);

router
  .route("/:id")
  .put(authenticate("admin"), updatePayment);

module.exports = router;
