import { validationResult } from "express-validator";
import Attendance from "../models/Attendance.js";
import User from "../models/User.js";
import { recognizeFace } from "../services/mlService.js";

export const markAttendance = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { imageBase64 } = req.body;
  const recognition = await recognizeFace(imageBase64);

  if (!recognition.matched || !recognition.userId) {
    return res.status(404).json({ message: "Face not recognized" });
  }

  const user = await User.findById(recognition.userId);
  if (!user) {
    return res.status(404).json({ message: "Recognized user no longer exists" });
  }

  const attendance = await Attendance.create({
    user: user._id,
    confidence: recognition.confidence
  });

  res.status(201).json({
    message: "Attendance marked",
    attendance,
    recognizedUser: {
      id: user._id,
      name: user.name,
      email: user.email
    }
  });
};

export const getMyAttendance = async (req, res) => {
  const records = await Attendance.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(30);

  res.json({ records });
};

export const getAdminSummary = async (req, res) => {
  const [totalUsers, totalAttendance, todayAttendance] = await Promise.all([
    User.countDocuments(),
    Attendance.countDocuments(),
    Attendance.countDocuments({
      createdAt: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
        $lte: new Date(new Date().setHours(23, 59, 59, 999))
      }
    })
  ]);

  const latestAttendance = await Attendance.find()
    .populate("user", "name email")
    .sort({ createdAt: -1 })
    .limit(20);

  res.json({
    stats: {
      totalUsers,
      totalAttendance,
      todayAttendance
    },
    latestAttendance
  });
};
