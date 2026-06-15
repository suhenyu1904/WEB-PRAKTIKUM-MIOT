const mongoose = require("mongoose");

const practicumGroupSchema = new mongoose.Schema(
  {
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

    groupNumber: {
      type: Number,
      required: true,
    },

    maxMembers: {
      type: Number,
      required: true,
      min: 1,
    },

    memberIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    isLocked: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

practicumGroupSchema.index(
  { scheduleSession: 1, groupNumber: 1 },
  { unique: true }
);

module.exports = mongoose.model("PracticumGroup", practicumGroupSchema);
