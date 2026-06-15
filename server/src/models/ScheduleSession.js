const mongoose = require("mongoose");

const scheduleSessionSchema = new mongoose.Schema(
  {
    practicumOffering: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PracticumOffering",
      required: true,
    },

    label: {
      type: String,
      default: "",
      trim: true,
    },

    day: {
      type: String,
      required: true,
      trim: true,
    },

    startTime: {
      type: String,
      required: true,
      trim: true,
    },

    endTime: {
      type: String,
      required: true,
      trim: true,
    },

    room: {
      type: String,
      default: "",
      trim: true,
    },

    groupCount: {
      type: Number,
      required: true,
      min: 1,
    },

    maxMembersPerGroup: {
      type: Number,
      required: true,
      min: 1,
    },

    totalCapacity: {
      type: Number,
      required: true,
    },

    assistantDutyIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    isActive: {
      type: Boolean,
      default: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ScheduleSession", scheduleSessionSchema);
