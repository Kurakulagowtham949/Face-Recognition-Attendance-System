import { validationResult } from "express-validator";
import User from "../models/User.js";
import { registerFace } from "../services/mlService.js";

export const me = async (req, res) => {
  res.json({ user: req.user });
};

export const registerUserFace = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { imageBase64 } = req.body;
  let result;
  try {
    result = await registerFace({
      userId: req.user._id.toString(),
      imageBase64
    });
  } catch (error) {
    console.error("ML Service error:", error.message);
    return res.status(503).json({ 
      message: "ML Service is currently unavailable. Please try again later." 
    });
  }

  await User.findByIdAndUpdate(req.user._id, { faceRegistered: true });

  res.status(201).json({
    message: "Face registered",
    faceSamples: result.faceSamples
  });
};

export const listUsers = async (req, res) => {
  const users = await User.find().select("-password").sort({ createdAt: -1 });
  res.json({ users });
};
