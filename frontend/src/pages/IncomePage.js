import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import { AuthContext } from "../context/AuthContext";
import { Modal, Button, Form, Badge, Card, Row, Col } from "react-bootstrap";

const IncomePage = () => {
  const { user, accessToken } = useContext(AuthContext);
  const [transactions, setTransactions] = useState([]);
  const Type = "incoming";
  const TX_API = process.env.REACT_APP_TRANSACTION_API || "http://localhost:4003";
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTx, setNewTx] = useState({
    type: "incoming",
    amount: "",
    note: "",
  });

  // Summary Stats
  const [summary, setSummary] = useState({
    total: 0,
    monthly: 0,
    average: 0,
  });

  // Fetch Incomes
  const fetchIncomes = async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const res = await axios.get(`${TX_API}/transactions/type/${Type}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const txs = Array.isArray(res.data)
        ? res.data
        : res.data.transactions || [];
      setTransactions(txs);
      calculateSummary(txs);
      setError("");
    } catch (err) {
      console.error("Error fetching income", err);
      setError("⚠️ Failed to fetch income. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) {
    fetchIncomes(); // or fetchExpenses(), fetchIncomes()
  }
}, [accessToken]);

  //fetchIncomes();
  // Calculate totals and averages
  const calculateSummary = (txs) => {
    if (!txs || txs.length === 0) {
      setSummary({ total: 0, monthly: 0, average: 0 });
      return;
    }

    const total = txs.reduce((sum, t) => sum + Number(t.amount || 0), 0);
    const thisMonth = new Date().getMonth();
    const monthly = txs
      .filter((t) => new Date(t.date).getMonth() === thisMonth)
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);
    const avg = total / txs.length;

    setSummary({
      total: total.toFixed(2),
      monthly: monthly.toFixed(2),
      average: avg.toFixed(2),
    });
  };

  // Handle Add Transaction
  const handleAddChange = (e) => {
    const { name, value } = e.target;
    setNewTx({
      ...newTx,
      [name]: name === "amount" ? Number(value) : value,
    });
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!accessToken) return;
    try {
      await axios.post(`${TX_API}/transactions/`, newTx, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setShowAddModal(false);
      fetchIncomes();
    } catch (err) {
      console.error("Error adding income", err);
      setError("⚠️ Failed to add income. Please try again.");
      alert("❌ Failed to add income");
    }
  };

  // 🔹 Function to get Income Status
  const getStatusBadge = (amount) => {
    if (amount >= 10000)
      return <Badge bg="success">High Income</Badge>;
    if (amount >= 5000)
      return <Badge bg="info" text="dark">Moderate Income</Badge>;
    return <Badge bg="secondary">Low Income</Badge>;
  };

  return (
    <>
     <Navbar />
    <div className="container mt-4">
      <h2 className="mb-4 text-success">💰 Income Transactions</h2>

      {/* 📊 Summary Section */}
      <Row className="mb-4">
        <Col md={4}>
          <Card className="shadow-sm border-success">
            <Card.Body>
              <Card.Title>Total Income</Card.Title>
              <h4 className="text-success fw-bold">₹{summary.total}</h4>
              <small className="text-muted">Overall earnings</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="shadow-sm border-info">
            <Card.Body>
              <Card.Title>This Month</Card.Title>
              <h4 className="text-info fw-bold">₹{summary.monthly}</h4>
              <small className="text-muted">Current month's income</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="shadow-sm border-secondary">
            <Card.Body>
              <Card.Title>Average Per Income</Card.Title>
              <h4 className="text-secondary fw-bold">₹{summary.average}</h4>
              <small className="text-muted">Average transaction</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Button
        variant="success"
        className="mb-3"
        onClick={() => setShowAddModal(true)}
      >
        + Add Income
      </Button>

      {loading ? (
        <div className="text-center my-4">Loading income...</div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : transactions.length === 0 ? (
        <div className="alert alert-info">No income transactions found.</div>
      ) : (
        <table className="table table-hover text-center align-middle shadow-sm rounded">
          <thead className="table-success">
            <tr>
              <th>Date</th>
              <th>Amount</th>
              <th>Note</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr key={tx.id}>
                <td>{new Date(tx.date).toLocaleDateString()}</td>
                <td>₹{tx.amount.toFixed(2)}</td>
                <td>{tx.note}</td>
                <td>{getStatusBadge(tx.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* ➕ Add Income Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add Income</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Amount</Form.Label>
              <Form.Control
                type="number"
                name="amount"
                value={newTx.amount}
                onChange={handleAddChange}
                placeholder="Enter income amount"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Note</Form.Label>
              <Form.Control
                type="text"
                name="note"
                value={newTx.note}
                onChange={handleAddChange}
                placeholder="e.g. Salary, Bonus, Freelance"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>
            Cancel
          </Button>
          <Button type="submit" variant="success" onClick={handleAddSubmit}>
            Add Income
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
    </>
  );
};

export default IncomePage;
