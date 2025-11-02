import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);

  const AUTH_API = process.env.REACT_APP_AUTH_API || "http://localhost:4001";

  // login with auth-service
  const login = async (email, password) => {
    const res = await axios.post(`${AUTH_API}/api/auth/login`, {
      email,
      password,
    });
    setUser(res.data.user);
    setAccessToken(res.data.accessToken);
    localStorage.setItem("refreshToken", res.data.refreshToken);
  };

  // logout
  const logout = () => {
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem("refreshToken");
  };

  // refresh token
  const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) return;
    try {
      const res = await axios.post(`${AUTH_API}/api/auth/refresh`, {
        refreshToken,
      });
      setAccessToken(res.data.accessToken);
    } catch (err) {
      logout();
    }
  };

  // auto refresh every 10 min
  useEffect(() => {
    const interval = setInterval(refreshAccessToken, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <AuthContext.Provider value={{ user, accessToken, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
