import express from "express";
import { addTransaction, getTransactions, updateTransaction, deleteTransaction,getTransactionByType , export_transactions} from "../controllers/transaction.controller.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

router.post("/", authenticate, addTransaction);
router.get("/", authenticate, getTransactions);
router.put("/:id", authenticate, updateTransaction);
router.delete("/:id", authenticate, deleteTransaction);
router.get("/type/:type", authenticate, getTransactionByType);
router.get("/export", authenticate, export_transactions);
export default router;
