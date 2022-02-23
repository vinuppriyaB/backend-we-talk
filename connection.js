const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose
      .connect(process.env.MONGO_URL)
      .then(() => console.log("Database connected"));
  } catch (e) {
    console.log(e);
  }
};

module.exports = connectDB;
