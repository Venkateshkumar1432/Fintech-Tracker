# Fintech Tracker

A full-stack finance tracking application that lets users log income and expenses, visualize their financial state, and manage profiles and authentication. It is built with a React front-end, Node.js/Express back-end services, Prisma ORM, and containerized for deployments via Docker and Kubernetes.

---

## 🚀 Project Overview

Fintech Tracker provides a modern personal finance dashboard with:

- **User authentication & profile management** (signup, login, OTP verification)
- **Income & expense tracking** with categories and transaction history
- **Responsive UI** built in React
- **Microservice architecture** with separate auth and transaction services
- **Containerization and deployment-ready** (Docker, Kubernetes manifests, Helm-ready structure)

---

## 🧱 Tech Stack

### Frontend
- **React** (with `create-react-app`) for SPA experience
- **React Router** for page navigation
- **Context API** for authentication state

### Backend Services
- **Node.js + Express** (separate services for auth and transactions)
- **Prisma ORM** with a SQL database (likely SQLite/Postgres in prod)
- REST APIs for authentication and transaction operations

### DevOps / Deployment
- **Docker** / `docker-compose` for local development
- **Kubernetes** manifests in `Deployement/` for production-grade deployments
- **CI/CD** pipeline hints via `jenkinsfile`

---

## 📁 Repository Structure

- `frontend/` - React application (UI, pages, components)
- `service/auth-service/` - Authentication service (signup, login, OTP, user profiles)
- `service/transaction-service/` - Transaction service (income/expense CRUD)
- `Deployement/` - Kubernetes manifests for multiple clusters/environments
- `docker-compose.yml` - Compose file for local multi-service testing

---

## 🛠️ Getting Started (Local Development)

### 1) Install prerequisites

- Node.js (>= 16)
- Docker (for containerized environments)
- (Optional) `docker-compose` if running with compose

### 2) Start services with Docker Compose

```bash
# From repository root
docker-compose up --build
```

This starts the frontend and both backend services and wires them together.

### 3) Access the app

- Frontend: `http://localhost:3000`
- Backend APIs:
  - Auth service: `http://localhost:4000`
  - Transaction service: `http://localhost:5000`

---

## 🧪 Running Tests

> Add tests here once available (frontend & backend testing frameworks).

---

## 📌 Notes & Next Improvements

- Add database seed scripts and migrations for prod-safe deployments
- Improve error handling and validation on APIs
- Add analytics/dashboard charts
- Add E2E tests (Cypress / Playwright)

---

## 📄 License

This project is provided as-is. Add your license information here.
