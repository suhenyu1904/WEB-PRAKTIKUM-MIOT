const multer = require("multer");
const path = require("path");

const ktmStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/ktm");
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(
      file.originalname
    )}`;

    cb(null, uniqueName);
  },
});

const imageFileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("File KTM harus berupa gambar JPG, PNG, JPEG, atau WEBP"), false);
  }
};

const uploadKtm = multer({
  storage: ktmStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
});

module.exports = {
  uploadKtm,
};
