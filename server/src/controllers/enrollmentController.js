const PracticumOffering = require("../models/PracticumOffering");
const ScheduleSession = require("../models/ScheduleSession");
const PracticumGroup = require("../models/PracticumGroup");
const Enrollment = require("../models/Enrollment");

const enrollToGroup = async (req, res) => {
  try {
    const { practicumId, groupId } = req.params;
    const { guidebookAccepted } = req.body;

    if (!guidebookAccepted) {
      return res.status(400).json({
        message: "Praktikan wajib menyetujui guidebook terlebih dahulu",
      });
    }

    const practicum = await PracticumOffering.findById(practicumId);

    if (!practicum) {
      return res.status(404).json({
        message: "Praktikum tidak ditemukan",
      });
    }

    if (practicum.status !== "open_registration") {
      return res.status(400).json({
        message: "Pendaftaran praktikum belum dibuka atau sudah ditutup",
      });
    }

    const existingEnrollment = await Enrollment.findOne({
      student: req.user._id,
      practicumOffering: practicumId,
      status: "registered",
    });

    if (existingEnrollment) {
      return res.status(409).json({
        message: "Kamu sudah terdaftar pada praktikum ini",
      });
    }

    const group = await PracticumGroup.findOne({
      _id: groupId,
      practicumOffering: practicumId,
      isLocked: false,
    });

    if (!group) {
      return res.status(404).json({
        message: "Kelompok tidak ditemukan atau sudah dikunci",
      });
    }

    const schedule = await ScheduleSession.findOne({
      _id: group.scheduleSession,
      practicumOffering: practicumId,
      isActive: true,
    });

    if (!schedule) {
      return res.status(404).json({
        message: "Jadwal sesi tidak ditemukan",
      });
    }

    const updateResult = await PracticumGroup.updateOne(
      {
        _id: groupId,
        memberIds: { $ne: req.user._id },
        $expr: {
          $lt: [{ $size: "$memberIds" }, "$maxMembers"],
        },
      },
      {
        $addToSet: {
          memberIds: req.user._id,
        },
      }
    );

    if (updateResult.modifiedCount === 0) {
      return res.status(409).json({
        message: "Kelompok sudah penuh atau kamu sudah masuk kelompok ini",
      });
    }

    try {
      const enrollment = await Enrollment.create({
        student: req.user._id,
        practicumOffering: practicumId,
        scheduleSession: schedule._id,
        group: groupId,
        guidebookAccepted: true,
        guidebookAcceptedAt: new Date(),
        status: "registered",
      });

      const populatedEnrollment = await Enrollment.findById(enrollment._id)
        .populate("student", "name nrp email")
        .populate("practicumOffering")
        .populate("scheduleSession")
        .populate({
          path: "group",
          populate: {
            path: "memberIds",
            select: "name nrp email",
          },
        });

      return res.status(201).json({
        message: "Berhasil mendaftar praktikum dan masuk kelompok",
        data: populatedEnrollment,
      });
    } catch (error) {
      await PracticumGroup.updateOne(
        { _id: groupId },
        { $pull: { memberIds: req.user._id } }
      );

      if (error.code === 11000) {
        return res.status(409).json({
          message: "Kamu sudah terdaftar pada praktikum ini",
        });
      }

      throw error;
    }
  } catch (error) {
    return res.status(500).json({
      message: "Gagal melakukan pendaftaran praktikum",
      error: error.message,
    });
  }
};

const getMyEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({
      student: req.user._id,
    })
      .populate({
        path: "practicumOffering",
        populate: {
          path: "course",
        },
      })
      .populate("scheduleSession")
      .populate({
        path: "group",
        populate: {
          path: "memberIds",
          select: "name nrp email",
        },
      })
      .sort({ createdAt: -1 });

    return res.json({
      data: enrollments,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Gagal mengambil data pendaftaran saya",
      error: error.message,
    });
  }
};

module.exports = {
  enrollToGroup,
  getMyEnrollments,
};
