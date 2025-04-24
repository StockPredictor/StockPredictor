require("dotenv").config();
const mongoose = require("mongoose");

const uri = process.env.MONGO_URI;

console.log("Connecting to MongoDB URI:", uri); // Debug

const connectDB = async () => {
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
