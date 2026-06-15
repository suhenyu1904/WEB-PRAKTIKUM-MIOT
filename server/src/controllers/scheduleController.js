const PracticumOffering = require("../models/PracticumOffering");
const ScheduleSession = require("../models/ScheduleSession");
const PracticumGroup = require("../models/PracticumGroup");

const createScheduleSession = async (req, res) => {
  try {
    const { practicumId } = req.params;

    const {
      label,
      day,
      startTime,
      endTime,
      room,
      groupCount,
      maxMembersPerGroup,
      assistantDutyIds,
    } = req.body;

    if (!day || !startTime || !endTime || !groupCount || !maxMembersPerGroup) {
      return res.status(400).json({
        message:
          "day, startTime, endTime, groupCount, dan maxMembersPerGroup wajib diisi",
      });
    }

    const practicum = await PracticumOffering.findById(practicumId);

    if (!practicum) {
      return res.status(404).json({
        message: "Praktikum tidak ditemukan",
      });
    }

    const totalCapacity = Number(groupCount) * Number(maxMembersPerGroup);

    const schedule = await ScheduleSession.create({
      practicumOffering: practicumId,
      label: label || "",
      day,
      startTime,
      endTime,
      room: room || "",
      groupCount,
      maxMembersPerGroup,
      totalCapacity,
      assistantDutyIds: assistantDutyIds || [],
      createdBy: req.user._id,
    });

    const groupDocs = [];

    for (let i = 1; i <= Number(groupCount); i++) {
      groupDocs.push({
        practicumOffering: practicumId,
        scheduleSession: schedule._id,
        groupNumber: i,
        maxMembers: Number(maxMembersPerGroup),
        memberIds: [],
      });
    }

    await PracticumGroup.insertMany(groupDocs);

    const groups = await PracticumGroup.find({
      scheduleSession: schedule._id,
    }).sort({ groupNumber: 1 });

    return res.status(201).json({
      message: "Jadwal sesi berhasil dibuat dan kelompok otomatis dibuat",
      data: {
        schedule,
        groups,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Gagal membuat jadwal sesi",
      error: error.message,
    });
  }
};

const getScheduleSessionsByPracticum = async (req, res) => {
  try {
    const { practicumId } = req.params;

    const practicum = await PracticumOffering.findById(practicumId);

    if (!practicum) {
      return res.status(404).json({
        message: "Praktikum tidak ditemukan",
      });
    }

    if (req.user.role === "student" && practicum.status !== "open_registration") {
      return res.status(403).json({
        message: "Praktikum belum dibuka untuk pendaftaran",
      });
    }

    const schedules = await ScheduleSession.find({
      practicumOffering: practicumId,
      isActive: true,
    })
      .populate("assistantDutyIds", "name email role")
      .sort({ day: 1, startTime: 1 });

    const scheduleIds = schedules.map((schedule) => schedule._id);

    const groups = await PracticumGroup.find({
      scheduleSession: { $in: scheduleIds },
    })
      .populate("memberIds", "name nrp email")
      .sort({ groupNumber: 1 });

    const schedulesWithGroups = schedules.map((schedule) => {
      const groupList = groups
        .filter(
          (group) =>
            group.scheduleSession.toString() === schedule._id.toString()
        )
        .map((group) => {
          const currentMembers = group.memberIds.length;
          const remainingSlots = group.maxMembers - currentMembers;

          return {
            _id: group._id,
            groupNumber: group.groupNumber,
            maxMembers: group.maxMembers,
            currentMembers,
            remainingSlots,
            isFull: currentMembers >= group.maxMembers,
            isLocked: group.isLocked,
            members: group.memberIds,
          };
        });

      return {
        ...schedule.toObject(),
        groups: groupList,
      };
    });

    return res.json({
      data: schedulesWithGroups,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Gagal mengambil jadwal sesi",
      error: error.message,
    });
  }
};

module.exports = {
  createScheduleSession,
  getScheduleSessionsByPracticum,
};
