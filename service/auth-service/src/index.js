import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import prisma from "./prisma.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);

// Serve uploaded files (avatars)
app.use("/api/uploads", express.static("uploads"));
app.get("/",(req,res) => {
  res.send("Hello World!");
})

// quick test route to list users (DEV ONLY)
app.get("/api/test-db", async (req, res) => {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, isVerified: true, createdAt: true }
  });
  res.json(users);
});

const PORT = process.env.PORT || 4001;
app.listen(PORT, () => {
  console.log(`Auth Service running on port ${PORT}`);
});
