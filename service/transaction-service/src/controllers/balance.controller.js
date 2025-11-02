import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

/**
 * Get Net Balance
 */
export const getBalance = async (req, res) => {
  try {
    const userId = req.user.userId;
    const balance = await prisma.balance.findUnique({ where: { userId } });
    res.json({ netBalance: balance ? balance.netAmount : 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
