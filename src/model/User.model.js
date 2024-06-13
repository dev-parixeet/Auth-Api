const mongoose = require("mongoose");

const user = new mongoose.Schema({
  firstname: { type: String, require: true },
  lastname: { type: String, require: true },
  email: { type: String, require: true },
  contact: { type: String, require: true},
  password: { type: String, require: true },
  authToken: { type: String },
  resetPasswordToken: { type: String },
  resetPasswordExpires: {type: Date},
  emailVerifiedToken: { type: String },
  emailVerified: {type: Boolean, default: false}
});

const User = mongoose.model("user", user);

module.exports = User;
