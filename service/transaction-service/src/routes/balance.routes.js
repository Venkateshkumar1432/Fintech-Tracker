import express from "express";
import { getBalance } from "../controllers/balance.controller.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

router.get("/", authenticate, getBalance);

export default router;
