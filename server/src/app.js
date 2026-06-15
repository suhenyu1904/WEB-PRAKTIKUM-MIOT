const courseRoutes = require("./routes/courseRoutes");
const practicumRoutes = require("./routes/practicumRoutes");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");
const scheduleRoutes = require("./routes/scheduleRoutes");
const enrollmentRoutes = require("./routes/enrollmentRoutes");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

app.get("/", (req, res) => {
  res.json({
    message: "Praktikum Lab System API is running",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/practicums", practicumRoutes);
app.use("/api/practicums", scheduleRoutes);
app.use("/api/enrollments", enrollmentRoutes);

app.use((err, req, res, next) => {
  return res.status(500).json({
    message: err.message || "Internal server error",
  });
});

module.exports = app;
