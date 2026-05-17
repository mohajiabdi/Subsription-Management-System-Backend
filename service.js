require("dotenv").config();

const mongoose = require("mongoose");
const app = require("./app");

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

const startService = async () => {
  try {
    if (MONGO_URI) {
      await mongoose.connect(MONGO_URI);
      console.log("MongoDB connected");
    } else {
      console.warn("MongoDB connection string not set");
    }

    app.listen(PORT, () => {
      console.log(`Service running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start service:", error.message);
    process.exit(1);
  }
};

startService();
