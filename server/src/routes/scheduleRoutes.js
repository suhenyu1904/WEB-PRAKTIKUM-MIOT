const express = require("express");

const {
  createScheduleSession,
  getScheduleSessionsByPracticum,
} = require("../controllers/scheduleController");

const { protect, allowRoles } = require("../middlewares/authMiddleware");

const router = express.Router();

router.use(protect);

router.get("/:practicumId/schedules", getScheduleSessionsByPracticum);

router.post(
  "/:practicumId/schedules",
  allowRoles("admin", "assistant"),
  createScheduleSession
);

module.exports = router;
