const Room = require("./model");

// ─── Create Room ─────────────────────────────────────────────────────────────

const createRoom = async (req, res) => {
  try {
    const room = await Room.create(req.body);
    return res.status(201).json({
      success: true,
      data: room,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create room",
      error: error.message,
    });
  }
};

// ─── Get Rooms ───────────────────────────────────────────────────────────────

const getRooms = async (req, res) => {
  try {
    const rooms = await Room.find();
    return res.status(200).json({
      success: true,
      count: rooms.length,
      data: rooms,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch rooms",
      error: error.message,
    });
  }
};

// ─── Get Single Room ──────────────────────────────────────────────────────────

const getRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }
    return res.status(200).json({
      success: true,
      data: room,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch room",
      error: error.message,
    });
  }
};

// ─── Update Room ─────────────────────────────────────────────────────────────

const updateRoom = async (req, res) => {
  try {
    const room = await Room.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Room updated",
      data: room,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update room",
      error: error.message,
    });
  }
};

// ─── Delete Room ─────────────────────────────────────────────────────────────

const deleteRoom = async (req, res) => {
  try {
    const room = await Room.findByIdAndDelete(req.params.id);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Room deleted",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete room",
      error: error.message,
    });
  }
};

module.exports = {
  createRoom,
  getRooms,
  getRoom,
  updateRoom,
  deleteRoom,
};
