require("dotenv").config();

const bcrypt = require("bcryptjs");
const connectDB = require("./config/db");
const User = require("./models/User");

const seedAdmin = async () => {
  try {
    await connectDB();

    const existingAdmin = await User.findOne({
      email: process.env.ADMIN_EMAIL.toLowerCase(),
    });

    if (existingAdmin) {
      console.log("Admin sudah ada");
      process.exit(0);
    }

    const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);

    await User.create({
      name: process.env.ADMIN_NAME || "Super Admin",
      email: process.env.ADMIN_EMAIL.toLowerCase(),
      passwordHash,
      role: "admin",
      accountStatus: "approved",
    });

    console.log("Admin berhasil dibuat");
    process.exit(0);
  } catch (error) {
    console.error("Gagal membuat admin:", error.message);
    process.exit(1);
  }
};

seedAdmin();
