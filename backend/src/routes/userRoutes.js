import { Router } from "express";
import { body } from "express-validator";
import { listUsers, me, registerUserFace } from "../controllers/userController.js";
import { authorize, protect } from "../middleware/auth.js";

const router = Router();

router.get("/me", protect, me);
router.post(
  "/register-face",
  protect,
  [body("imageBase64").isString().notEmpty()],
  registerUserFace
);
router.get("/", protect, authorize("admin"), listUsers);

export default router;
