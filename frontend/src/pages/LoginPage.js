import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { FaUserAlt, FaLock, FaEye, FaEyeSlash, FaSpinner } from "react-icons/fa";

const LoginPage = () => {
  const [form, setForm] = useState({ email: "", password: "", remember: false });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.type === "checkbox" ? e.target.checked : e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form.email, form.password);
      // optionally persist remember-me email locally
      if (form.remember) localStorage.setItem("savedEmail", form.email);
      navigate("/");
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "Login failed. Check credentials and try again.");
    } finally {
      setLoading(false);
    }
  };

  // try to prefill saved email
  React.useEffect(() => {
    const saved = localStorage.getItem("savedEmail");
    if (saved) setForm((f) => ({ ...f, email: saved, remember: true }));
  }, []);

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card shadow-lg overflow-hidden" style={{ maxWidth: 920, margin: "0 auto", borderRadius: 14 }}>
        <div className="row g-0">
          <div className="col-12 col-md-5 d-flex flex-column justify-content-center align-items-start p-4" style={{ background: "linear-gradient(135deg,#0ea5a4,#6366f1)", color: "white" }}>
            <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>FinTrack</h1>
            <p style={{ opacity: 0.95, marginBottom: 12 }}>Fast. Secure. Insightful.</p>
            <ul style={{ listStyle: "none", padding: 0, lineHeight: 1.9, margin: 0 }}>
              <li>• Track income & expenses</li>
              <li>• Export transactions</li>
              <li>• Manage profile & security</li>
            </ul>
            <div style={{ fontSize: 12, opacity: 0.9, marginTop: 12 }}>Need help? venkateshnagond1432@gmail.com</div>
          </div>

          <div className="col-12 col-md-7 p-4 bg-white">
            <div className="mb-3 text-center">
              <h3 className="fw-bold">Welcome back</h3>
              <p className="text-muted mb-0">Sign in to your account to continue</p>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Email</label>
                <div className="input-group">
                  <span className="input-group-text"><FaUserAlt /></span>
                  <input
                    type="email"
                    name="email"
                    className="form-control"
                    placeholder="you@company.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                    aria-label="Email"
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Password</label>
                <div className="input-group">
                  <span className="input-group-text"><FaLock /></span>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    className="form-control"
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    aria-label="Password"
                  />
                  <button type="button" className="btn btn-light" onClick={() => setShowPassword((s) => !s)} aria-label="Toggle password visibility">
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="form-check">
                  <input className="form-check-input" type="checkbox" name="remember" id="remember" checked={form.remember} onChange={handleChange} />
                  <label className="form-check-label" htmlFor="remember">Remember me</label>
                </div>
                
              </div>

              <button type="submit" className="btn btn-primary w-100 d-flex justify-content-center align-items-center" disabled={loading} style={{ padding: "10px 14px", borderRadius: 10 }}>
                {loading ? <FaSpinner className="me-2 fa-spin" /> : null}
                <span>{loading ? "Signing in..." : "Sign in"}</span>
              </button>
            </form>

            <div className="mt-4 text-center">
              <small className="text-muted">Don't have an account? <Link to="/signup">Create one</Link></small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
