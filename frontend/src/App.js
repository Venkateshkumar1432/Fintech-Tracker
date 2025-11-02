import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./components/PrivateRoute";
//import Navbar from "./components/Navbar";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import DashboardPage from "./pages/DashboardPage";
import IncomePage from "./pages/IncomePage";
import ExpensePage from "./pages/ExpensePage";
import ProfilePage from "./pages/ProfilePage";
import VerifyOtp from "./pages/VerifyOtp";
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        {/* <Navbar /> */}
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />
          {/* Protected */}
          <Route path="/" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
          <Route path="/income" element={<PrivateRoute><IncomePage /></PrivateRoute>} />
          <Route path="/expense" element={<PrivateRoute><ExpensePage /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
        </Routes>
      </BrowserRouter>    
    </AuthProvider>
  );
}

export default App;
