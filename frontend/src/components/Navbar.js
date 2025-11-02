import React, { useContext, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Navbar = () => {
  const { logout, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navLinks = [
    { name: "Dashboard", path: "/" },
    { name: "Income", path: "/income" },
    { name: "Expense", path: "/expense" },
    { name: "Profile", path: "/profile" },
  ];

  return (
    <nav className="navbar navbar-expand-lg shadow-sm py-3" style={{ background: "linear-gradient(90deg, #6f42c1, #ff6f61)" }}>
      <div className="container">
        {/* Brand / Logo */}
        <Link className="navbar-brand d-flex align-items-center fw-bold text-white fs-4" to="/">
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              backgroundColor: "rgba(255,255,255,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginRight: "10px",
              fontWeight: "bold",
              fontSize: "20px",
              boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
            }}
          >
            💰
          </div>
          FinTech
        </Link>

        {/* Hamburger button */}
        <button
          className="navbar-toggler border-0"
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" style={{ filter: "invert(1)" }}></span>
        </button>

        {/* Links */}
        <div className={`collapse navbar-collapse ${isOpen ? "show" : ""}`}>
          <ul className="navbar-nav ms-auto mb-2 mb-lg-0 align-items-lg-center">
            {navLinks.map((link) => (
              <li className="nav-item mx-lg-2" key={link.path}>
                <Link
                  className={`nav-link fw-semibold position-relative text-white ${
                    location.pathname === link.path ? "active-link" : ""
                  }`}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </Link>
              </li>
            ))}

            {/* Logout button */}
            {user && (
              <li className="nav-item ms-lg-3 mt-2 mt-lg-0">
                <button
                  className="btn btn-light text-primary fw-bold px-4 py-2 rounded-pill shadow-sm"
                  onClick={handleLogout}
                  onMouseOver={(e) => (e.target.style.transform = "scale(1.05)")}
                  onMouseOut={(e) => (e.target.style.transform = "scale(1)")}
                  style={{ transition: "all 0.3s ease-in-out" }}
                >
                  Logout
                </button>
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* Extra CSS */}
      <style>
        {`
          .nav-link {
            transition: all 0.3s ease-in-out;
          }
          .nav-link:hover {
            color: #28a745 !important;
          }
          .nav-link::after {
            content: "";
            position: absolute;
            width: 0%;
            height: 2px;
            bottom: -3px;
            left: 0;
            background-color: #28a745;
            transition: width 0.3s ease-in-out;
          }
          .nav-link:hover::after, .active-link::after {
            width: 100%;
          }
          .active-link {
            font-weight: 700;
            color: #28a745 !important;
          }
        `}
      </style>
    </nav>
  );
};

export default Navbar;
