import React, { useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";

function VerifyOtp() {
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ email comes from signup response or localStorage fallback
  const email = location.state?.email || localStorage.getItem("verifyEmail");

  const AUTH_API = process.env.REACT_APP_AUTH_API || "http://localhost:4001";

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post(`${AUTH_API}/auth/verify-otp`, { email, otp });

      alert("Verification successful! Please login.");
      localStorage.removeItem("verifyEmail");
      navigate("/login");
    } catch (error) {
      console.error(error.response?.data || error.message);
      alert("Invalid OTP!");
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div
        className="card shadow-lg p-4"
        style={{
          width: "400px",
          borderRadius: "16px",
          transition: "0.3s ease-in-out",
        }}
      >
        <div className="text-center mb-4">
          <h2 className="fw-bold text-warning">OTP Verification 🔐</h2>
          <p className="text-muted">
            Enter the 6-digit OTP sent to <b>{email}</b>
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            maxLength="6"
            className="form-control shadow-sm mb-3 text-center fs-5 fw-bold"
            placeholder="Enter 6-digit OTP"
            required
            style={{ borderRadius: "12px", letterSpacing: "6px" }}
          />
          <button
            className="btn btn-warning w-100 fw-semibold shadow-sm"
            type="submit"
            style={{
              borderRadius: "12px",
              transition: "all 0.3s ease-in-out",
            }}
            onMouseOver={(e) => (e.target.style.transform = "scale(1.03)")}
            onMouseOut={(e) => (e.target.style.transform = "scale(1)")}
          >
            Verify OTP
          </button>
        </form>
      </div>
    </div>
  );
}

export default VerifyOtp;
