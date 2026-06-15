const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    nrp: {
      type: String,
      trim: true,
      sparse: true,
      unique: true,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },

    phone: {
      type: String,
      trim: true,
    },

    passwordHash: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["admin", "assistant", "student"],
      required: true,
      default: "student",
    },

    ktmImage: {
      type: String,
      default: null,
    },

    accountStatus: {
      type: String,
      enum: ["pending_verification", "approved", "rejected", "suspended"],
      default: "pending_verification",
    },

    rejectedReason: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
