const express = require("express");
const {
  createAssistant,
  getPendingStudents,
  updateStudentVerification,
} = require("../controllers/adminController");

const { protect, allowRoles } = require("../middlewares/authMiddleware");

const router = express.Router();

router.use(protect);
router.use(allowRoles("admin"));

router.post("/assistants", createAssistant);
router.get("/students/pending", getPendingStudents);
router.patch("/students/:studentId/verification", updateStudentVerification);

module.exports = router;
