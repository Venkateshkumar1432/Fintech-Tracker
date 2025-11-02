import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import transactionRoutes from "./routes/transaction.routes.js";
import balanceRoutes from "./routes/balance.routes.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/transaction/health", (req, res) => res.send("Simple Transaction Service running 🚀"));

app.use("/api/transactions", transactionRoutes);
app.use("/api/balance", balanceRoutes);

const PORT = process.env.PORT || 4003;
app.listen(PORT, () => console.log(`🚀 Transaction Service running on port ${PORT}`));
