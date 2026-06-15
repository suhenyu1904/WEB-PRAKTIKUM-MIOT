const express = require("express");

const {
  createPracticumOffering,
  getPracticumOfferings,
  getPracticumOfferingById,
  updatePracticumOffering,
  updatePracticumStatus,
} = require("../controllers/practicumController");

const { protect, allowRoles } = require("../middlewares/authMiddleware");

const router = express.Router();

router.use(protect);

router.get("/", getPracticumOfferings);
router.get("/:practicumId", getPracticumOfferingById);

router.post("/", allowRoles("admin", "assistant"), createPracticumOffering);
router.patch("/:practicumId", allowRoles("admin", "assistant"), updatePracticumOffering);
router.patch(
  "/:practicumId/status",
  allowRoles("admin", "assistant"),
  updatePracticumStatus
);

module.exports = router;
