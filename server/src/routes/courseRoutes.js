const express = require("express");

const {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
} = require("../controllers/courseController");

const { protect, allowRoles } = require("../middlewares/authMiddleware");

const router = express.Router();

router.use(protect);

router.get("/", getCourses);
router.get("/:courseId", getCourseById);

router.post("/", allowRoles("admin"), createCourse);
router.patch("/:courseId", allowRoles("admin"), updateCourse);

module.exports = router;
