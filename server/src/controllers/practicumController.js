const Course = require("../models/Course");
const PracticumOffering = require("../models/PracticumOffering");

const createPracticumOffering = async (req, res) => {
  try {
    const {
      courseId,
      title,
      academicYear,
      semester,
      registrationStart,
      registrationEnd,
      guidebookTitle,
      guidebookText,
      assistantIds,
      settings,
    } = req.body;

    if (!courseId || !title || !academicYear || !semester) {
      return res.status(400).json({
        message: "courseId, title, academicYear, dan semester wajib diisi",
      });
    }

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        message: "Mata kuliah tidak ditemukan",
      });
    }

    const practicum = await PracticumOffering.create({
      course: courseId,
      title,
      academicYear,
      semester,
      registrationStart: registrationStart || null,
      registrationEnd: registrationEnd || null,
      guidebookTitle: guidebookTitle || "",
      guidebookText: guidebookText || "",
      assistantIds: assistantIds || [],
      settings: {
        allowStudentChooseGroup: settings?.allowStudentChooseGroup ?? true,
        maxReschedulePerStudent: settings?.maxReschedulePerStudent ?? 1,
        groupLocked: settings?.groupLocked ?? false,
      },
      createdBy: req.user._id,
    });

    const populatedPracticum = await PracticumOffering.findById(practicum._id)
      .populate("course")
      .populate("assistantIds", "name email role");

    return res.status(201).json({
      message: "Praktikum berhasil dibuka",
      data: populatedPracticum,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Gagal membuka praktikum",
      error: error.message,
    });
  }
};

const getPracticumOfferings = async (req, res) => {
  try {
    let filter = {};

    if (req.user.role === "student") {
      filter.status = "open_registration";
    }

    const practicums = await PracticumOffering.find(filter)
      .populate("course")
      .populate("assistantIds", "name email role")
      .sort({ createdAt: -1 });

    return res.json({
      data: practicums,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Gagal mengambil data praktikum",
      error: error.message,
    });
  }
};

const getPracticumOfferingById = async (req, res) => {
  try {
    const practicum = await PracticumOffering.findById(req.params.practicumId)
      .populate("course")
      .populate("assistantIds", "name email role");

    if (!practicum) {
      return res.status(404).json({
        message: "Praktikum tidak ditemukan",
      });
    }

    if (req.user.role === "student" && practicum.status !== "open_registration") {
      return res.status(403).json({
        message: "Praktikum belum dibuka untuk pendaftaran",
      });
    }

    return res.json({
      data: practicum,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Gagal mengambil detail praktikum",
      error: error.message,
    });
  }
};

const updatePracticumOffering = async (req, res) => {
  try {
    const practicum = await PracticumOffering.findById(req.params.practicumId);

    if (!practicum) {
      return res.status(404).json({
        message: "Praktikum tidak ditemukan",
      });
    }

    const allowedFields = [
      "title",
      "academicYear",
      "semester",
      "registrationStart",
      "registrationEnd",
      "guidebookTitle",
      "guidebookText",
      "agreementRequired",
      "assistantIds",
      "settings",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        practicum[field] = req.body[field];
      }
    });

    await practicum.save();

    const populatedPracticum = await PracticumOffering.findById(practicum._id)
      .populate("course")
      .populate("assistantIds", "name email role");

    return res.json({
      message: "Praktikum berhasil diperbarui",
      data: populatedPracticum,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Gagal memperbarui praktikum",
      error: error.message,
    });
  }
};

const updatePracticumStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatus = [
      "draft",
      "open_registration",
      "closed_registration",
      "ongoing",
      "finished",
      "archived",
    ];

    if (!allowedStatus.includes(status)) {
      return res.status(400).json({
        message: "Status praktikum tidak valid",
      });
    }

    const practicum = await PracticumOffering.findById(req.params.practicumId);

    if (!practicum) {
      return res.status(404).json({
        message: "Praktikum tidak ditemukan",
      });
    }

    practicum.status = status;
    await practicum.save();

    return res.json({
      message: `Status praktikum berhasil diubah menjadi ${status}`,
      data: practicum,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Gagal mengubah status praktikum",
      error: error.message,
    });
  }
};

module.exports = {
  createPracticumOffering,
  getPracticumOfferings,
  getPracticumOfferingById,
  updatePracticumOffering,
  updatePracticumStatus,
};
