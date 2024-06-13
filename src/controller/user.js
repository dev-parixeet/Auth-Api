const User = require("../model/User.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const { sendMail } = require("../utils/util");
const mongoose = require("mongoose");

const SignInUser = async (req, res) => {
  console.log(req.body, "body");
  try {
    const findUser = User.findOne({ email: req.body.email });

    if (!findUser) {
      return res.status(400).send({
        message: "Email already exists",
      });
    }

    const id = new mongoose.Types.ObjectId();

    //genrate token
    const token = jwt.sign(
      { id: id, email: req.body.email },
      "your_secret_key",
      { expiresIn: "2h" }
    );
    console.log("singUp Page token: ", token);
    // console.log(user, "user");

    // send mail with token

    // const emailVerificationToken = jwt.sign(
    //   { id: user._id, email: user.email },
    //   "your_email_secret_key",
    //   { expiresIn: "24h" }
    // );
    // console.log("emailVerificationToken", emailVerificationToken);

    const user = await User.create({
      _id: id,
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      email: req.body.email,
      contact: req.body.contact,
      password: await bcrypt.hash(req.body.password, 10),
      emailVerifiedToken: token,
    });
    await sendMail(
      user.email,
      "New Account",
      `Welcome to Excellent web world<br/>${token}<br/>${user.firstname}<br/><a href="http://localhost:5173/email-verify/?token=${token}" style="display: inline-block; padding: 10px 20px; font-size: 16px; color: white; background-color: #007BFF; text-decoration: none; border-radius: 5px;">Verify Email</a>`
    );

    res.send({ user, token });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ error: "An error occurred while creating the user." });
  }
};

const LogInUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    console.log("user", user);

    if (!user) {
      return res
        .status(404)
        .send({ error: "Username/Password doesn't match." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log("passwordvalid", isPasswordValid);

    if (!isPasswordValid) {
      return res.status(404).send({ error: "Invalid credentials." });
    }

    const token = jwt.sign({ _id: user._id }, "password", {
      expiresIn: "24h",
    });

    user.authToken = token;
    console.log("token", token);
    await user.save();

    req.session = user.firstname;
    res.cookie("username", user.firstname, { httpOnly: true, secure: false });

    res.send({ message: "Login successful", token, data: user });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "An error occurred during login." });
  }
};

const LogOutUser = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    console.log(token);
    await User.updateMany(
      { authToken: token },
      {
        $set: { authToken: "" },
      }
    );
    console.log("session=>", req.session);

    res.status(200).send({ message: "removed" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "An error occurred during logout" });
    console.log("An error occurred during logout", error);
  }
};

const EditUserProfile = async (req, res) => {
  console.log(req.user, "body");
  try {
    const user = await User.findById(req.params.id);
    console.log("gfsdfsdfsdfsdf", user);
    if (!user) {
      return res.status(404).send({ error: "User not found." });
    }
    user.firstname = req.body.firstname || user.firstname;
    user.lastname = req.body.lastname || user.lastname;
    user.email = req.body.email || user.email;
    user.contact = req.body.contact || user.contact;

    if (req.body.password) {
      user.password = await bcrypt.hash(req.body.password, 10);
    }
    await user.save();

    console.log(user, "user");
    return res.status(200).send({ message: "User updated", data: user });
  } catch (error) {
    console.log("Edit User Profile Failed");
    res
      .status(500)
      .send({ error: "error occurred while updating the user profile." });
  }
};

const ForgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email: email });
    console.log("fsdfsdfsdf", user);
    if (!user) {
      return res.status(404).send({ error: "User not found." });
    }

    const token = jwt.sign({ _id: user._id }, "password", {
      expiresIn: "50m",
    });

    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000;

    await user.save();

    await sendMail(
      user.email,
      "Password Reset",
      `
      <p>You are receiving this because you (or someone else) have requested the reset of the password for your account.</p><br/>
      <p>Please click on the following link, or paste this into your browser to complete the process:
      <a href="http://localhost:5173/reset-password/?token=${token}">token</a><p><br/><br/>
        <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>`
    );

    res
      .status(200)
      .send({ message: "Password reset link has been sent to your email." });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ error: "An error occurred while requesting password reset." });
  }
};

const ResetPassword = async (req, res) => {
  try {
    const { password } = req.body;
    console.log(req.user._id, "req.user._id", req.user.id);
    const user = await User.findOne({
      _id: req.user.id,
    });
    console.log(user, "useruser");
    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).send({ message: "Password has been reset successfully." });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ error: "An error occurred while resetting the password." });
  }
};

const EmailVerification = async (req, res) => {
  const emailToken = req.query.token;

  console.log(emailToken, "emailToken");

  const emailVerificationToken = jwt.verify(emailToken, "your_secret_key");

  console.log("emailVerificationToken", emailVerificationToken);

  const user = await User.findOne({ emailVerifiedToken: emailToken });
  if (!user) return res.status(400).send("Invalid token");

  user.emailVerifiedToken = null;
  user.emailVerified = true;
  await user.save();

  res.send("email verified sucessfully");
  try {
  } catch (error) {
    res.status(400).send("An error occured");
  }
};

module.exports = {
  SignInUser,
  LogInUser,
  LogOutUser,
  EditUserProfile,
  ForgotPassword,
  ResetPassword,
  EmailVerification,
};
