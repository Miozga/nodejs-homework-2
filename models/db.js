const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const uri = process.env.MONGO_URI;

const connectDB = async () => {
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Database connection successful");
  } catch (error) {
    console.error("Database connection error:", error);
    process.exit(1);
  }
};

module.exports = connectDB;
