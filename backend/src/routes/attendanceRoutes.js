import { Router } from "express";
import { body } from "express-validator";
import {
  getAdminSummary,
  getMyAttendance,
  markAttendance
} from "../controllers/attendanceController.js";
import { authorize, protect } from "../middleware/auth.js";

const router = Router();

router.post(
  "/mark",
  protect,
  [body("imageBase64").isString().notEmpty()],
  markAttendance
);
router.get("/me", protect, getMyAttendance);
router.get("/admin/summary", protect, authorize("admin"), getAdminSummary);

export default router;
