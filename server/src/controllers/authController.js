const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const isAllowedItsEmail = (email) => {
  const allowedDomain = process.env.ALLOWED_EMAIL_DOMAIN || "its.ac.id";
  const emailDomain = email.split("@")[1];

  return emailDomain && emailDomain.endsWith(allowedDomain);
};

const createToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

const registerStudent = async (req, res) => {
  try {
    const { name, nrp, email, phone, password } = req.body;

    if (!name || !nrp || !email || !phone || !password) {
      return res.status(400).json({
        message: "Nama, NRP, email ITS, nomor HP, dan password wajib diisi",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "Foto KTM wajib diupload",
      });
    }

    if (!isAllowedItsEmail(email.toLowerCase())) {
      return res.status(400).json({
        message: "Email harus menggunakan email ITS",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password minimal 8 karakter",
      });
    }

    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { nrp }],
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Email atau NRP sudah terdaftar",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const student = await User.create({
      name,
      nrp,
      email: email.toLowerCase(),
      phone,
      passwordHash,
      role: "student",
      ktmImage: req.file.path,
      accountStatus: "pending_verification",
    });

    return res.status(201).json({
      message: "Registrasi berhasil. Akun menunggu verifikasi asisten/admin.",
      data: {
        id: student._id,
        name: student.name,
        nrp: student.nrp,
        email: student.email,
        phone: student.phone,
        role: student.role,
        accountStatus: student.accountStatus,
        ktmImage: student.ktmImage,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Terjadi kesalahan saat registrasi",
      error: error.message,
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email dan password wajib diisi",
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(401).json({
        message: "Email atau password salah",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Email atau password salah",
      });
    }

    if (user.accountStatus !== "approved") {
      return res.status(403).json({
        message: `Akun belum dapat digunakan. Status akun: ${user.accountStatus}`,
      });
    }

    const token = createToken(user);

    return res.json({
      message: "Login berhasil",
      token,
      data: {
        id: user._id,
        name: user.name,
        nrp: user.nrp,
        email: user.email,
        phone: user.phone,
        role: user.role,
        accountStatus: user.accountStatus,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Terjadi kesalahan saat login",
      error: error.message,
    });
  }
};

const getMe = async (req, res) => {
  return res.json({
    data: req.user,
  });
};

module.exports = {
  registerStudent,
  login,
  getMe,
};
