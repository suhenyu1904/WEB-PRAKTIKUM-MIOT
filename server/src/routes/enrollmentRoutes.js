const express = require("express");

const {
  enrollToGroup,
  getMyEnrollments,
} = require("../controllers/enrollmentController");

const { protect, allowRoles } = require("../middlewares/authMiddleware");

const router = express.Router();

router.use(protect);

router.get("/me", allowRoles("student"), getMyEnrollments);

router.post(
  "/practicums/:practicumId/groups/:groupId",
  allowRoles("student"),
  enrollToGroup
);

module.exports = router;
