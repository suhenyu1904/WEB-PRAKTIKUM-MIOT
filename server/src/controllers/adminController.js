const bcrypt = require("bcryptjs");
const User = require("../models/User");

const createAssistant = async (req, res) => {
  try {
    const { name, nrp, email, phone, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Nama, email, dan password wajib diisi",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password minimal 8 karakter",
      });
    }

    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, ...(nrp ? [{ nrp }] : [])],
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Email atau NRP sudah digunakan",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const assistant = await User.create({
      name,
      nrp: nrp || undefined,
      email: email.toLowerCase(),
      phone: phone || "",
      passwordHash,
      role: "assistant",
      accountStatus: "approved",
    });

    return res.status(201).json({
      message: "Akun asisten berhasil dibuat",
      data: {
        id: assistant._id,
        name: assistant.name,
        nrp: assistant.nrp,
        email: assistant.email,
        phone: assistant.phone,
        role: assistant.role,
        accountStatus: assistant.accountStatus,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Gagal membuat akun asisten",
      error: error.message,
    });
  }
};

const getPendingStudents = async (req, res) => {
  try {
    const students = await User.find({
      role: "student",
      accountStatus: "pending_verification",
    }).select("-passwordHash");

    return res.json({
      data: students,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Gagal mengambil data praktikan pending",
      error: error.message,
    });
  }
};

const updateStudentVerification = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { status, reason } = req.body;

    if (!["approved", "rejected", "suspended"].includes(status)) {
      return res.status(400).json({
        message: "Status harus approved, rejected, atau suspended",
      });
    }

    const student = await User.findOne({
      _id: studentId,
      role: "student",
    });

    if (!student) {
      return res.status(404).json({
        message: "Data praktikan tidak ditemukan",
      });
    }

    student.accountStatus = status;
    student.rejectedReason = status === "rejected" ? reason || "Tidak memenuhi ketentuan" : null;

    await student.save();

    return res.json({
      message: `Status akun praktikan berhasil diubah menjadi ${status}`,
      data: {
        id: student._id,
        name: student.name,
        nrp: student.nrp,
        email: student.email,
        accountStatus: student.accountStatus,
        rejectedReason: student.rejectedReason,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Gagal memperbarui status praktikan",
      error: error.message,
    });
  }
};

module.exports = {
  createAssistant,
  getPendingStudents,
  updateStudentVerification,
};
