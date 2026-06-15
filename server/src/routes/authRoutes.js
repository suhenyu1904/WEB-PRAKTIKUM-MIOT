const express = require("express");
const {
  registerStudent,
  login,
  getMe,
} = require("../controllers/authController");

const { uploadKtm } = require("../middlewares/uploadMiddleware");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/register/student", uploadKtm.single("ktm"), registerStudent);
router.post("/login", login);
router.get("/me", protect, getMe);

module.exports = router;
