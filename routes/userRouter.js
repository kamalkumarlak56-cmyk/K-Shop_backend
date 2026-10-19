const express = require("express");
const { registerUser, verify, reVerify, login, logout, forgotPass, otpVerify, changePass, allUsers, getUserById } = require("../controllers/userController");
const { isAuthenticated, isAdmin } = require("../middlewares/isAuthenticated");

const router = express.Router();

router.post("/register", registerUser);
router.post("/verify", verify);
router.post("/reverify", reVerify);
router.post("/login", login);
router.post("/logout", isAuthenticated, logout);
router.post("/forgot-Pass", forgotPass);
router.post("/otp-Verify/:email", otpVerify);
router.post("/change-Password/:email", changePass);
router.get("/all-users", isAuthenticated, isAdmin, allUsers);
router.get("/getUserById/:userId", getUserById);



module.exports = router;
