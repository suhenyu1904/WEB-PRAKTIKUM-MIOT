const mongoose = require("mongoose");

const enrollmentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    practicumOffering: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PracticumOffering",
      required: true,
    },

    scheduleSession: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ScheduleSession",
      required: true,
    },

    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PracticumGroup",
      required: true,
    },

    guidebookAccepted: {
      type: Boolean,
      default: false,
    },

    guidebookAcceptedAt: {
      type: Date,
      default: null,
    },

    status: {
      type: String,
      enum: ["registered", "cancelled", "rescheduled"],
      default: "registered",
    },
  },
  {
    timestamps: true,
  }
);

enrollmentSchema.index(
  { student: 1, practicumOffering: 1 },
  { unique: true }
);

module.exports = mongoose.model("Enrollment", enrollmentSchema);
