const mongoose = require("mongoose");

const practicumOfferingSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    academicYear: {
      type: String,
      required: true,
      trim: true,
    },

    semester: {
      type: String,
      enum: ["ganjil", "genap", "pendek"],
      required: true,
    },

    status: {
      type: String,
      enum: [
        "draft",
        "open_registration",
        "closed_registration",
        "ongoing",
        "finished",
        "archived",
      ],
      default: "draft",
    },

    registrationStart: {
      type: Date,
      default: null,
    },

    registrationEnd: {
      type: Date,
      default: null,
    },

    guidebookTitle: {
      type: String,
      default: "",
    },

    guidebookText: {
      type: String,
      default: "",
    },

    agreementRequired: {
      type: Boolean,
      default: true,
    },

    settings: {
      allowStudentChooseGroup: {
        type: Boolean,
        default: true,
      },

      maxReschedulePerStudent: {
        type: Number,
        default: 1,
      },

      groupLocked: {
        type: Boolean,
        default: false,
      },
    },

    assistantIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("PracticumOffering", practicumOfferingSchema);
