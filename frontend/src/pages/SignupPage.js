import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { FaEye, FaEyeSlash, FaSpinner } from "react-icons/fa";

const AUTH_API = process.env.REACT_APP_AUTH_API || "http://localhost:4001";

const SignupPage = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    preferences: "Rupees",
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleFileChange = (e) => {
    const f = e.target.files?.[0] || null;
    setAvatarFile(f);
    if (f) setAvatarPreview(URL.createObjectURL(f));
    else setAvatarPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const formData = new FormData();
      Object.keys(form).forEach((key) => formData.append(key, form[key]));
      if (avatarFile) formData.append("avatarUrl", avatarFile);

      const res = await axios.post(`${AUTH_API}/auth/register`,
      {    
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone,
        preferences: form.preferences,
      }, 
        {
        headers: {
        "Content-Type": "application/json",
    },
      }
    );

      // navigate to OTP verification with email
      navigate("/verify-otp", { state: { email: form.email } });
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-auto bg-light py-4">
      <div className="card shadow-lg overflow-hidden" style={{ maxWidth: 920, margin: "0 auto", borderRadius: 14 }}>
        <div className="row g-0">
          <div className="col-12 col-md-5 d-flex flex-column justify-content-center align-items-start p-4" style={{ background: "linear-gradient(135deg,#06b6d4,#7c3aed)", color: "white" }}>
            <h1 style={{ fontSize: 26, fontWeight: 800 }}>Create your account</h1>
            <p style={{ opacity: 0.95 }}>Join FinTrack to manage your finances with ease.</p>
            <ul style={{ listStyle: "none", padding: 0, lineHeight: 1.9, margin: 0 }}>
              <li>• Secure authentication</li>
              <li>• Exportable reports</li>
              <li>• Personalized dashboard</li>
            </ul>
            <div style={{ fontSize: 12, opacity: 0.9, marginTop: 12 }}>Privacy-first. We don't sell your data.</div>
          </div>

          <div className="col-12 col-md-7 p-4 bg-white">
            <div className="mb-3 text-center">
              <h3 className="fw-bold">Sign up</h3>
              <p className="text-muted mb-0">Create an account to get started</p>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-12 mb-3">
                  <label className="form-label">Full name</label>
                  <input name="name" className="form-control" value={form.name} onChange={handleChange} required />
                </div>

                <div className="col-12 mb-3">
                  <label className="form-label">Email</label>
                  <input name="email" type="email" className="form-control" value={form.email} onChange={handleChange} required />
                </div>

                <div className="col-12 mb-3">
                  <label className="form-label">Password</label>
                  <div className="input-group">
                    <input name="password" type={showPassword ? "text" : "password"} className="form-control" value={form.password} onChange={handleChange} required />
                    <button type="button" className="btn btn-light" onClick={() => setShowPassword((s) => !s)}>{showPassword ? <FaEyeSlash /> : <FaEye />}</button>
                  </div>
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">Phone</label>
                  <input name="phone" type="tel" className="form-control" value={form.phone} onChange={handleChange} />
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">Currency</label>
                  <select name="preferences" className="form-control" value={form.preferences} onChange={handleChange}>
                    <option value="USD">USD</option>
                    <option value="Rupees">Rupees</option>
                  </select>
                </div>

                <div className="col-12 mb-3">
                  <label className="form-label">Avatar (optional)</label>
                  <input type="file" accept="image/*" className="form-control" onChange={handleFileChange} />
                  {avatarPreview && <img src={avatarPreview} alt="avatar preview" style={{ width: 72, height: 72, borderRadius: 12, marginTop: 8 }} />}
                </div>
              </div>

              <button type="submit" className="btn btn-primary w-100 d-flex justify-content-center align-items-center" disabled={loading} style={{ padding: "10px 14px", borderRadius: 10 }}>
                {loading ? <FaSpinner className="me-2 fa-spin" /> : null}
                <span>{loading ? "Creating account..." : "Create account"}</span>
              </button>
            </form>

            <div className="mt-4 text-center">
              <small className="text-muted">Already have an account? <Link to="/login">Login</Link></small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
