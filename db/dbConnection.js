const mongoose = require("mongoose");

const dbURI = "mongodb://localhost:27017/exercies";

const connectDB = async () => {
  try {
    await mongoose.connect(dbURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Mongoose connected to " + dbURI);

    // Set up connection events
    mongoose.connection.on("error", (err) => {
      console.error("Mongoose connection error: " + err);
    });

    mongoose.connection.on("disconnected", () => {
      console.log("Mongoose disconnected");
    });
  } catch (error) {
    console.error("Mongoose connection error: " + error);
  }
};

module.exports = connectDB;
