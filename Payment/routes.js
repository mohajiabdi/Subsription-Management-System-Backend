const express = require("express");
const {
  createPayment,
  getPayments,
  updatePayment,
  deletePayment,
} = require("./controllers");
const authenticate = require("../middleware/authenticate");

const router = express.Router();

router
  .route("/")
  .get(authenticate("admin", "agent", "customer"), getPayments)
  .post(authenticate("admin", "agent", "customer"), createPayment);

router
  .route("/:id")
  .put(authenticate("admin"), updatePayment)
  .patch(authenticate("admin"), updatePayment)
  .delete(authenticate("admin"), deletePayment);

module.exports = router;
