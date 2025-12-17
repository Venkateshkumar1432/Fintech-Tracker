import prisma from "../prisma.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendOtpEmail } from "../utils/email.js";

const OTP_TTL_MINUTES = Number(process.env.OTP_TTL_MINUTES || 10);

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit
}

function signAccessToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "15m" });
}

function signRefreshToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });
}

// Register or re-send OTP to existing unverified user
export const register = async (req, res) => {
  try {
    const { email, password, name, phone, preferences } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and password required" });

    const existing = await prisma.user.findUnique({ where: { email } });

    const hashed = await bcrypt.hash(password, 10);
    const otpCode = generateOtp();
    const otpExpiry = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

    let avatarUrl = undefined;
if (req.file) {
  avatarUrl = `/api/uploads/${req.file.filename}`;
}

if (existing) {
  if (existing.isVerified) {
    return res.status(400).json({ message: "Email already registered and verified" });
  }

  // Update unverified existing user
  await prisma.user.update({
    where: { email },
    data: { password: hashed, name, otpCode, otpExpiry, phone, preferences, avatarUrl },
  });
} else {
  // Create new user
  await prisma.user.create({
    data: { email, password: hashed, name, otpCode, otpExpiry, phone, preferences, avatarUrl },
  });
}


    // await sendOtpEmail(email, otpCode);
    // SEND EMAIL ASYNC (fire & forget)
    console.log("DEBUG OTP:", otpCode);
   sendOtpEmail(email, otpCode)
  .then(() => console.log("OTP email sent"))
  .catch(err => console.error("OTP email failed:", err));

    return res.status(201).json({ message: "Registered (or updated). OTP sent to email." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};

// Verify OTP
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: "Email and OTP required" });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ message: "User not found" });
    if (user.isVerified) return res.status(400).json({ message: "User already verified" });

    if (!user.otpCode || user.otpCode !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }
    if (!user.otpExpiry || user.otpExpiry < new Date()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    await prisma.user.update({
      where: { email },
      data: { isVerified: true, otpCode: null, otpExpiry: null },
    });

    return res.json({ message: "Email verified successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};

// Resend OTP
export const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email required" });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ message: "User not found" });
    if (user.isVerified) return res.status(400).json({ message: "User already verified" });

    const otpCode = generateOtp();
    const otpExpiry = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

    await prisma.user.update({
      where: { email },
      data: { otpCode, otpExpiry },
    });

    await sendOtpEmail(email, otpCode);
    return res.json({ message: "OTP resent to email" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};

// Login -> returns accessToken + refreshToken (refresh token stored in DB)
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and password required" });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });

    if (!user.isVerified) return res.status(403).json({ message: "Please verify your email via OTP" });

    const accessToken = signAccessToken(user.id);
    const refreshToken = signRefreshToken(user.id);

    // store refresh token
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt,
      },
    });

    return res.json({ accessToken, refreshToken,user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};

// Refresh -> client sends { token } (refresh token)
export const refreshToken = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ message: "Refresh token required" });

    // verify JWT signature
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    // find token in DB and ensure it's not revoked/expired
    const dbToken = await prisma.refreshToken.findUnique({ where: { token } });
    if (!dbToken || dbToken.revoked) return res.status(403).json({ message: "Refresh token revoked or invalid" });
    if (dbToken.expiresAt < new Date()) return res.status(403).json({ message: "Refresh token expired" });

    // Issue new access token
    const accessToken = signAccessToken(decoded.userId);
    return res.json({ accessToken });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};

// Logout -> revoke refresh token (client sends refresh token)
export const logout = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ message: "Refresh token required" });

    await prisma.refreshToken.updateMany({
      where: { token },
      data: { revoked: true },
    });

    return res.json({ message: "Logged out (refresh token revoked)" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};

export const getProfile = async (req, res) => {
  try {
    const { email } = req.params;
    const user = await prisma.user.findUnique({
      where: { email },
      // select: { id: true, email: true, name: true, phone: true, preferences: true, avatarUrl: true },
    });
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.json(user);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    // JWT payload uses { userId } when issuing tokens in this service.
    // Support either shape (userId or id) and guard if req.user is missing.
    const authenticatedUserId = req.user?.userId ?? req.user?.id;
    console.log("Authenticated user ID:", authenticatedUserId);
    console.log("User ID to delete:", id);

    if (!authenticatedUserId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    // IDs are UUID strings in Prisma schema; compare as strings
    if (id !== authenticatedUserId) {
      return res.status(403).json({ message: "Unauthorized action" });
    }
    // Clean up dependent records that reference the user to avoid FK constraint errors.
    // Refresh tokens are stored with a userId FK; remove them first.
    await prisma.refreshToken.deleteMany({ where: { userId: id } });

    // If there are other relations (transactions, profiles, etc.) add cleanup here or
    // configure cascade deletes in the Prisma schema.

    await prisma.user.delete({
      where: { id },
    });
    return res.json({ message: "User deleted successfully" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}



// export const deleteUser = async (req, res) => {
//   try {
//     const userId = parseInt(req.params.id);

//     // ✅ use req.user.userId instead of req.user.id
//     if (req.user.userId !== userId) {
//       return res.status(403).json({ message: "Unauthorized action" });
//     }

//     await prisma.user.delete({
//       where: { id: userId },
//     });

//     res.status(200).json({ message: "User deleted successfully" });
//   } catch (error) {
//     console.error("❌ Error deleting user:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };