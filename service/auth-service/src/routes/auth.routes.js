import express from "express";
import {
  register,
  verifyOtp,
  resendOtp,
  login,
  refreshToken,
  logout,
  getProfile,
  deleteUser
} from "../controllers/auth.controller.js";
import { upload } from "./../middleware/upload.js";
import { authenticate  } from "../middleware/auth.js";
const router = express.Router();

router.post("/register" , upload.single("avatarUrl"), register);        // { email, password, name? }
router.post("/verify-otp", verifyOtp);         // { email, otp }
router.post("/resend-otp", resendOtp);    // { email }
router.post("/login", login);              // { email, password }
router.post("/refresh", refreshToken);     // { token }
router.post("/logout", logout);            // { token }
router.get("/:email", getProfile);
router.delete("/delete/:id", authenticate, deleteUser);
export default router;
   

