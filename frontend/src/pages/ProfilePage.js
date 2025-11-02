import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import { AuthContext } from "../context/AuthContext";
import { Card, Row, Col, Button, Spinner, Badge } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
const ProfilePage = () => {
  const { user, accessToken, logout } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpense: 0,
    netBalance: 0,
  });
   const navigate = useNavigate();
  // Fetch profile
  const AUTH_API = process.env.REACT_APP_AUTH_API || "http://localhost:4001";
  const TX_API = process.env.REACT_APP_TRANSACTION_API || "http://localhost:4003";

  const fetchProfile = async () => {
    if (!accessToken || !user?.email) return;
    setLoading(true);
    try {
      const res = await axios.get(`${AUTH_API}/api/auth/${user.email}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setProfile(res.data);
      setError("");
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError("⚠️ Failed to fetch profile.");
    } finally {
      setLoading(false);
    }
  };


   // ✅ Handle Account Deletion
  const handleDeleteAccount = async () => {
    if (!window.confirm("⚠️ Are you sure you want to permanently delete your account? This action cannot be undone.")) {
      return;
    }

    try {
      await axios.delete(`${AUTH_API}/api/auth/delete/${user.id}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      alert("Your account has been deleted successfully.");
      logout(); // clear context + tokens
      navigate("/register");
    } catch (err) {
      console.error("❌ Error deleting user:", err);
      alert(err.response?.data?.message || "Error deleting account.");
    }
  };


  // Fetch summary data
  const fetchSummary = async () => {
    if (!accessToken) return;
    try {
      const [incomeRes, expenseRes] = await Promise.all([
        axios.get(`${TX_API}/api/transactions/type/incoming`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
        axios.get(`${TX_API}/api/transactions/type/expense`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
      ]);

      const totalIncome = (Array.isArray(incomeRes.data) ? incomeRes.data : []).reduce(
        (sum, t) => sum + Number(t.amount || 0),
        0
      );
      const totalExpense = (Array.isArray(expenseRes.data) ? expenseRes.data : []).reduce(
        (sum, t) => sum + Number(t.amount || 0),
        0
      );

      setSummary({
        totalIncome,
        totalExpense,
        netBalance: totalIncome - totalExpense,
      });
    } catch (err) {
      console.error("Error fetching summary:", err);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchSummary();
  }, [accessToken, user?.email]);

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
        <div>Loading profile...</div>
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-danger mt-4">{error}</div>;
  }

  if (!profile) {
    return <div className="alert alert-info mt-4">Profile not found.</div>;
  }

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0].toUpperCase())
      .join("");
  };

  return (
    <>
     <Navbar />
    <div className="container mt-5">
      <Card className="shadow-lg rounded-4 border-0 p-4" style={{ background: "linear-gradient(to right, #6f42c1, #ff6f61)" }}>
        <Row className="align-items-center text-white mb-3">
          <Col md={3} className="text-center mb-3 mb-md-0">
            <div
              className="rounded-circle d-flex align-items-center justify-content-center"
              style={{
                width: "120px",
                height: "120px",
                fontSize: "40px",
                fontWeight: "bold",
                background: "#ffffff33",
              }}
            >
              {getInitials(profile.name)}
            </div>
          </Col>
          <Col md={9}>
            <h2 className="fw-bold mb-2">{profile.name}</h2>
            <Row className="mb-2">
              <Col md={6}>
                <strong>Email:</strong> <span>{profile.email}</span>
              </Col>
              <Col md={6}>
                <strong>Phone:</strong>{" "}
                <span>{profile.phone || <Badge bg="light" text="dark">N/A</Badge>}</span>
              </Col>
            </Row>
            <Row className="mb-2">
              <Col md={6}>
                <strong>Joined:</strong>{" "}
                <span>{new Date(profile.createdAt).toLocaleDateString()}</span>
              </Col>
              <Col md={6}>
                <strong>Location:</strong>{" "}
                <span>{profile.location || <Badge bg="light" text="dark">N/A</Badge>}</span>
              </Col>
            </Row>
            <Row className="mt-3">
              <Col>
                <Button variant="light" className="fw-bold" onClick={logout}>
                  Logout
                </Button>
              </Col>
            </Row>
          </Col>
        </Row>

       {/* Delete Button */}
          <button
            className="btn btn-outline-danger w-50 fw-semibold mt-3"
            onClick={handleDeleteAccount}
            style={{
              background: "#ff0808ff",
              color: "#000000ff",
              fontSize: "20px",
              borderRadius: "12px",
              transition: "all 0.3s ease-in-out",
            }}
            onMouseOver={(e) => (e.target.style.transform = "scale(1.05)")}
            onMouseOut={(e) => (e.target.style.transform = "scale(1)")}
          >
            Delete Account
          </button>

        {/* Summary Cards */}
        <Row className="text-center mt-4">
          <Col md={4} className="mb-2">
            <Card className="shadow-sm border-success">
              <Card.Body>
                <Card.Title>Total Income</Card.Title>
                <h4 className="text-success fw-bold">₹{summary.totalIncome}</h4>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4} className="mb-2">
            <Card className="shadow-sm border-danger">
              <Card.Body>
                <Card.Title>Total Expenses</Card.Title>
                <h4 className="text-danger fw-bold">₹{summary.totalExpense}</h4>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4} className="mb-2">
            <Card className="shadow-sm border-primary">
              <Card.Body>
                <Card.Title>Net Balance</Card.Title>
                <h4 className={summary.netBalance >= 0 ? "text-success fw-bold" : "text-danger fw-bold"}>
                  ₹{summary.netBalance}
                </h4>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
    </>
  );
};

export default ProfilePage;
