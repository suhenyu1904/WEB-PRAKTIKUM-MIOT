const Course = require("../models/Course");

const createCourse = async (req, res) => {
  try {
    const { code, name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        message: "Nama mata kuliah wajib diisi",
      });
    }

    const existingCourse = await Course.findOne({
      $or: [
        { name: name.trim() },
        ...(code ? [{ code: code.trim().toUpperCase() }] : []),
      ],
    });

    if (existingCourse) {
      return res.status(409).json({
        message: "Mata kuliah sudah ada",
      });
    }

    const course = await Course.create({
      code,
      name,
      description,
      createdBy: req.user._id,
    });

    return res.status(201).json({
      message: "Mata kuliah berhasil dibuat",
      data: course,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Gagal membuat mata kuliah",
      error: error.message,
    });
  }
};

const getCourses = async (req, res) => {
  try {
    const courses = await Course.find().sort({ createdAt: -1 });

    return res.json({
      data: courses,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Gagal mengambil data mata kuliah",
      error: error.message,
    });
  }
};

const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);

    if (!course) {
      return res.status(404).json({
        message: "Mata kuliah tidak ditemukan",
      });
    }

    return res.json({
      data: course,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Gagal mengambil detail mata kuliah",
      error: error.message,
    });
  }
};

const updateCourse = async (req, res) => {
  try {
    const { code, name, description, isActive } = req.body;

    const course = await Course.findById(req.params.courseId);

    if (!course) {
      return res.status(404).json({
        message: "Mata kuliah tidak ditemukan",
      });
    }

    if (code !== undefined) course.code = code;
    if (name !== undefined) course.name = name;
    if (description !== undefined) course.description = description;
    if (isActive !== undefined) course.isActive = isActive;

    await course.save();

    return res.json({
      message: "Mata kuliah berhasil diperbarui",
      data: course,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Gagal memperbarui mata kuliah",
      error: error.message,
    });
  }
};

module.exports = {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
};
