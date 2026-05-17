const express = require("express");
const {
  createRoom,
  getRooms,
  getRoom,
  updateRoom,
  deleteRoom,
} = require("./controllers");
const authenticate = require("../middleware/authenticate");

const router = express.Router();

router
  .route("/")
  .get(authenticate("admin", "receptionist", "customer", "agent"), getRooms)
  .post(authenticate("admin", "receptionist"), createRoom);

router
  .route("/:id")
  .get(authenticate("admin", "receptionist", "customer", "agent"), getRoom)
  .put(authenticate("admin"), updateRoom)
  .delete(authenticate("admin"), deleteRoom);

module.exports = router;
