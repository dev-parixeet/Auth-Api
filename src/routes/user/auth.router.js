const { Router } = require("express");
const {
  SignInUser,
  LogInUser,
  LogOutUser,
  EditUserProfile,
  ForgotPassword,
  ResetPassword,
  EmailVerification,
} = require("../../controller/user");
const {
  authenticateToken,
  verifyResetPasswordToken,
} = require("../../middelware/middleware");
const router = Router();

router.post("/signin", SignInUser);
router.post("/login", LogInUser);
router.post("/logout", authenticateToken, LogOutUser);
router.put("/user-profile/:id", EditUserProfile);
router.get("/user-profile/:id", EditUserProfile);
router.post("/forgot-password", ForgotPassword);
// router.get("/verify-reset-password", verifyResetPassword)
router.post("/reset-password", verifyResetPasswordToken, ResetPassword);
router.get("/email-verify", EmailVerification);

module.exports = router;
