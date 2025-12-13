import React, { useEffect, useState, useContext, useMemo } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import { AuthContext } from "../context/AuthContext";
import {
  Modal,
  Button,
  Form,
  Card,
  Table,
  Badge,
  Row,
  Col,
  Spinner,
} from "react-bootstrap";
import CountUp from "react-countup";
import {
  FaMoneyBillWave,
  FaPlusCircle,
  FaTrash,
  FaEdit,
  FaArrowUp,
  FaArrowDown,
} from "react-icons/fa";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const DashboardPage = () => {
  const { user, accessToken } = useContext(AuthContext);

  // Data
  const [transactions, setTransactions] = useState([]);
  const [netBalance, setNetBalance] = useState(0);

  // UI state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Add / Edit modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTx, setEditingTx] = useState(null);

  // Forms
  const [newTx, setNewTx] = useState({ type: "incoming", amount: "", note: "" });
  const [editForm, setEditForm] = useState({ type: "", amount: 0, note: "" });

  const TX_API = process.env.REACT_APP_TRANSACTION_API || "http://localhost:4003";

  // Fetch transactions & balance for current user
  const fetchTransactions = async () => {
    if (!accessToken) return;
    setLoading(true);
    setError("");
    try {
      const [txRes, balRes] = await Promise.all([
        axios.get(`${TX_API}/transactions/`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
        axios.get(`${TX_API}/balance/`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
      ]);

      const txData = Array.isArray(txRes.data) ? txRes.data : txRes.data.transactions || [];
      // Ensure amounts are numbers and date fields exist
      const normalized = txData.map((t) => ({
        id: t.id,
        type: t.type,
        amount: Number(t.amount || 0),
        note: t.note || t.description || "",
        date: t.date || t.createdAt || new Date().toISOString(),
        createdAt: t.createdAt || t.date || new Date().toISOString(),
      }));

      setTransactions(normalized);
      setNetBalance(Number(balRes.data.netBalance ?? 0));
    } catch (err) {
      console.error("Error fetching transactions:", err);
      setError("⚠️ Failed to load transactions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Initial + whenever accessToken changes (new login)
  useEffect(() => {
    if (accessToken) fetchTransactions();
    else {
      // Clear when logged out
      setTransactions([]);
      setNetBalance(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  // Derived totals (useMemo - efficient)
  const totalIncome = useMemo(
    () =>
      transactions
        .filter((t) => t.type === "incoming")
        .reduce((s, t) => s + Number(t.amount || 0), 0),
    [transactions]
  );

  const totalExpense = useMemo(
    () =>
      transactions
        .filter((t) => t.type === "expense")
        .reduce((s, t) => s + Number(t.amount || 0), 0),
    [transactions]
  );

  const avgTransaction = useMemo(() => {
    if (!transactions.length) return 0;
    const sum = transactions.reduce((s, t) => s + Number(t.amount || 0), 0);
    return Number((sum / transactions.length).toFixed(2));
  }, [transactions]);

  // Pie chart data
  const pieData = useMemo(
    () => [
      { name: "Income", value: totalIncome },
      { name: "Expense", value: totalExpense },
      { name: "Balance", value: netBalance },
    ],
    [totalIncome, totalExpense, netBalance]
  );

  const COLORS = ["#28a745", "#dc3545", "#ffc107"]; // Income, Expense, Balance

  // Helpers
  const getAmountColor = (amount) => {
    if (amount >= 10000) return "danger";
    if (amount >= 5000) return "warning";
    return "secondary";
  };

  // ---------- Add Transaction ----------
  const handleNewChange = (e) => {
    const { name, value } = e.target;
    setNewTx((p) => ({
      ...p,
      [name]: name === "amount" ? (value === "" ? "" : Number(value)) : value,
    }));
  };

  const handleAddSubmit = async (e) => {
    e?.preventDefault?.();
    if (!accessToken) return alert("Not authenticated");
    if (!["incoming", "expense"].includes(newTx.type)) return alert("Invalid type");
    if (newTx.amount === "" || isNaN(Number(newTx.amount))) return alert("Enter a valid amount");

    try {
      await axios.post(`${TX_API}/transactions/`, { ...newTx }, { headers: { Authorization: `Bearer ${accessToken}` } });
      setShowAddModal(false);
      setNewTx({ type: "incoming", amount: "", note: "" });
      fetchTransactions();
    } catch (err) {
      console.error("Add failed:", err);
      alert(err.response?.data?.message || "Failed to add transaction");
    }
  };

  // ---------- Edit Transaction ----------
  const openEditModal = (tx) => {
    setEditingTx(tx);
    setEditForm({ type: tx.type || "expense", amount: Number(tx.amount || 0), note: tx.note || "" });
    setShowEditModal(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((p) => ({ ...p, [name]: name === "amount" ? (value === "" ? "" : Number(value)) : value }));
  };

  const handleEditSubmit = async () => {
    if (!editingTx) return;
    if (!["incoming", "expense"].includes(editForm.type)) return alert("Invalid type");
    if (editForm.amount === "" || isNaN(Number(editForm.amount))) return alert("Enter a valid amount");

    try {
      await axios.put(`${TX_API}/transactions/${editingTx.id}`, editForm, { headers: { Authorization: `Bearer ${accessToken}` } });
      setShowEditModal(false);
      setEditingTx(null);
      fetchTransactions();
    } catch (err) {
      console.error("Update failed:", err);
      alert(err.response?.data?.message || "Failed to update transaction");
    }
  };

  // ---------- Delete Transaction ----------
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this transaction?")) return;
    try {
      await axios.delete(`${TX_API}/transactions/${id}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      fetchTransactions();
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete transaction");
    }
  };

  const handleExport = async () => {
  try {
    const response = await axios.get(`${TX_API}/transactions/export`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      responseType: "blob", // <-- important for downloading files
    });

    // Create blob URL and trigger download
    const blob = new Blob([response.data], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "transactions_export.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
  } catch (error) {
    console.error("Export failed:", error);
    alert("❌ Failed to export data");
  }
};


  return (
    <>
    <Navbar />
    <div className="container mt-4">
        
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap">
        <h2 className="mb-2">
          👋 Hi <span className="text-success">{user?.name || "User"}</span>, Welcome to{" "}
          <strong>FinTrack Dashboard</strong>
        </h2>
        <Button
            variant="outline-primary"
            onClick={handleExport}
            className="ms-2"
        >
            📦 Download Transactions
        </Button>
        <Button variant="success" onClick={() => setShowAddModal(true)}>
          <FaPlusCircle className="me-2" />
          Add Transaction
        </Button>

      </div>

      {/* Summary Cards */}
      <Row className="mb-4 g-3">
        <Col md={3} sm={6}>
          <Card className="shadow-sm text-center border-success">
            <Card.Body>
              <FaArrowUp className="text-success fs-3 mb-2" />
              <h6>Total Income</h6>
              <h4 className="text-success fw-bold">
                ₹
                <CountUp end={totalIncome} duration={1.2} separator="," />
              </h4>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3} sm={6}>
          <Card className="shadow-sm text-center border-danger">
            <Card.Body>
              <FaArrowDown className="text-danger fs-3 mb-2" />
              <h6>Total Expenses</h6>
              <h4 className="text-danger fw-bold">
                ₹
                <CountUp end={totalExpense} duration={1.2} separator="," />
              </h4>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3} sm={6}>
          <Card className="shadow-sm text-center border-primary">
            <Card.Body>
              <FaMoneyBillWave className="text-primary fs-3 mb-2" />
              <h6>Average / Transaction</h6>
              <h4 className="text-primary fw-bold">
                ₹
                <CountUp end={avgTransaction} duration={1.2} decimals={2} />
              </h4>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3} sm={6}>
          <Card className="shadow-sm text-center border-warning">
            <Card.Body>
              <FaMoneyBillWave className="text-warning fs-3 mb-2" />
              <h6>Net Balance</h6>
              <h4 className={`fw-bold ${netBalance >= 0 ? "text-success" : "text-danger"}`}>
                ₹
                <CountUp end={netBalance} duration={1.2} separator="," />
              </h4>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Pie Chart */}
      <Card className="shadow-sm mb-4 p-3">
        <Card.Title className="text-center mb-3">💹 Financial Overview</Card.Title>
        <ResponsiveContainer width="100%" height={320}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={110}
              paddingAngle={4}
              dataKey="value"
              isAnimationActive={true}
              animationDuration={1000}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
              labelLine={false}
            >
              {pieData.map((entry, idx) => (
                <Cell key={`cell-${idx}`} fill={COLORS[idx]} stroke="#fff" strokeWidth={2} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => `₹${value}`} />
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </ResponsiveContainer>
      </Card>

      {/* Transactions Table */}
      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" />
          <div className="mt-2">Loading transactions...</div>
        </div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : transactions.length === 0 ? (
        <div className="alert alert-info">No transactions found. Add your first transaction!</div>
      ) : (
        <Table striped bordered hover responsive className="shadow-sm">
          <thead className="table-dark text-center">
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Note</th>
              <th>Level</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody className="align-middle text-center">
            {transactions.map((tx) => (
              <tr key={tx.id}>
                <td>{new Date(tx.date || tx.createdAt).toLocaleDateString()}</td>
                <td>
                  <Badge bg={tx.type === "incoming" ? "success" : "danger"} pill>
                    {tx.type}
                  </Badge>
                </td>
                <td className={tx.type === "incoming" ? "text-success fw-bold" : "text-danger fw-bold"}>
                  ₹{Number(tx.amount).toFixed(2)}
                </td>
                <td>{tx.note || "-"}</td>
                <td>
                  <Badge bg={getAmountColor(tx.amount)}>
                    {tx.amount >= 10000 ? "High" : tx.amount >= 5000 ? "Moderate" : "Low"}
                  </Badge>
                </td>
                <td>
                  <Button variant="warning" size="sm" className="me-2" onClick={() => openEditModal(tx)}>
                    <FaEdit />
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => handleDelete(tx.id)}>
                    <FaTrash />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Edit Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Transaction</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={(e) => { e.preventDefault(); handleEditSubmit(); }}>
            <Form.Group className="mb-3">
              <Form.Label>Type</Form.Label>
              <Form.Select name="type" value={editForm.type} onChange={handleEditChange}>
                <option value="incoming">Incoming</option>
                <option value="expense">Expense</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Amount</Form.Label>
              <Form.Control type="number" name="amount" value={editForm.amount} onChange={handleEditChange} />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Note</Form.Label>
              <Form.Control type="text" name="note" value={editForm.note} onChange={handleEditChange} />
            </Form.Group>

            <div className="d-flex justify-content-end">
              <Button variant="secondary" onClick={() => setShowEditModal(false)} className="me-2">Cancel</Button>
              <Button variant="primary" type="submit">Save Changes</Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Add Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add Transaction</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={(e) => { e.preventDefault(); handleAddSubmit(); }}>
            <Form.Group className="mb-3">
              <Form.Label>Type</Form.Label>
              <Form.Select name="type" value={newTx.type} onChange={handleNewChange}>
                <option value="incoming">Incoming</option>
                <option value="expense">Expense</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Amount</Form.Label>
              <Form.Control type="number" name="amount" value={newTx.amount} onChange={handleNewChange} />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Note</Form.Label>
              <Form.Control type="text" name="note" value={newTx.note} onChange={handleNewChange} />
            </Form.Group>

            <div className="d-flex justify-content-end">
              <Button variant="secondary" onClick={() => setShowAddModal(false)} className="me-2">Cancel</Button>
              <Button variant="primary" type="submit">Add Transaction</Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
    </>
  );
};

export default DashboardPage;
