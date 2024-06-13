const jwt = require("jsonwebtoken");
const User = require("../model/User.model");

const authenticateToken = (req, res, next) => {
  console.log("<<<<< helloo", req);
  const authHeader = req.headers.authorization;
  console.log("authHeader", authHeader);
  const token = authHeader && authHeader.split(" ")[1];
  console.log("token", token);

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, "password", async (err, user) => {
    if (err) return res.status(403).send({ message: "Invalid token" });

    const findUser = await User.findOne({ authToken: token });
    if (!findUser) {
      return res.status(401).send({ message: "Invalid token" });
    }
    req.user = user;
    // req.session = session.user;
    next();
  });
};

const verifyResetPasswordToken = async (req, res, next) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).send({ message: "Token is required" });
    }
    const user = await User.findOne({
      resetPasswordToken: token,
    });
    console.log(token, "-00-0-0-0-0-0-0", user);
    const verify = await jwt.verify(token, "password");

    console.log(verify);
    req.verifiedToken = verify;
    req.user = user;

    next();
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

module.exports = { authenticateToken, verifyResetPasswordToken };
