import { PrismaClient } from "@prisma/client";
import { Parser } from "json2csv";


const prisma = new PrismaClient();

/**
 * Add Transaction
 */
export const addTransaction = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { type, amount, note } = req.body;

    if (!["incoming", "expense"].includes(type)) {
      return res.status(400).json({ message: "Invalid transaction type" });
    }

    // Get or create balance record
    let balance = await prisma.balance.findUnique({ where: { userId } });
    if (!balance) {
      balance = await prisma.balance.create({
        data: { userId, netAmount: 0 },
      });
    }

    // Adjust balance
    let newBalance = balance.netAmount;
    if (type === "incoming") newBalance += amount;
    if (type === "expense") newBalance -= amount;

    const transaction = await prisma.transaction.create({
      data: { userId, type, amount, note },
    });

    await prisma.balance.update({
      where: { userId },
      data: { netAmount: newBalance },
    });
    

    res.status(201).json({ transaction, netBalance: newBalance });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Get all transactions
 */
export const getTransactions = async (req, res) => {
  try {
    const userId = req.user.userId;
    const transactions = await prisma.transaction.findMany({
      where: { userId },
      orderBy: { date: "desc" },
    });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ================== EXPORT CSV ==================
export const export_transactions = async (req, res) => {
  try {
    const userId = req.user.userId;
    const transactions = await prisma.transaction.findMany({
      where: { userId },
      orderBy: { date: "desc" },
    });
    const json2csvParser = new Parser();
    const csv = json2csvParser.parse(transactions);
    res.header("Content-Type", "text/csv");
    res.attachment("transactions.csv");
    return res.send(csv);
    //res.json(transactions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};


/**
 * Update Transaction
 */
export const updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const { type, amount, note } = req.body;

    if (!["incoming", "expense"].includes(type)) {
      return res.status(400).json({ message: "Invalid transaction type" });
    }

    const transaction = await prisma.transaction.findUnique({ where: { id } });
    if (!transaction || transaction.userId !== userId) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    // Recalculate balance: first undo old transaction
    let balance = await prisma.balance.findUnique({ where: { userId } });
    let newBalance = balance.netAmount;
    if (transaction.type === "incoming") newBalance -= transaction.amount;
    if (transaction.type === "expense") newBalance += transaction.amount;

    // Apply updated transaction
    if (type === "incoming") newBalance += amount;
    if (type === "expense") newBalance -= amount;

    const updatedTransaction = await prisma.transaction.update({
      where: { id },
      data: { type, amount, note },
    });

    await prisma.balance.update({
      where: { userId },
      data: { netAmount: newBalance },
    });

    res.json({ transaction: updatedTransaction, netBalance: newBalance });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Delete Transaction
 */
export const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const transaction = await prisma.transaction.findUnique({ where: { id } });
    if (!transaction || transaction.userId !== userId) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    // Adjust balance by undoing this transaction
    let balance = await prisma.balance.findUnique({ where: { userId } });
    let newBalance = balance.netAmount;
    if (transaction.type === "incoming") newBalance -= transaction.amount;
    if (transaction.type === "expense") newBalance += transaction.amount;

    await prisma.transaction.delete({ where: { id } });

    await prisma.balance.update({
      where: { userId },
      data: { netAmount: newBalance },
    });

    res.json({ message: "Transaction deleted", netBalance: newBalance });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ NEW: Get Transactions by Type
export const getTransactionByType = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { type } = req.params;

    if (type !== "incoming" && type !== "expense") {
      return res.status(400).json({ message: "Invalid transaction type" });
    }

    const transactions = await prisma.transaction.findMany({
      where: { userId, type },
      orderBy: { date: "desc" },
    });

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: "Error fetching transactions by type", error });
  }
};

