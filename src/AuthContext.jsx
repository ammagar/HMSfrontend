import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api } from "./api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("shd_token");
    if (!token) {
      setReady(true);
      return;
    }
    api
      .get("/auth/me")
      .then((data) => setUser(data.user))
      .catch(() => {
        localStorage.removeItem("shd_token");
      })
      .finally(() => setReady(true));
  }, []);

  const login = useCallback((token, userData) => {
    localStorage.setItem("shd_token", token);
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("shd_token");
    setUser(null);
  }, []);

  return <AuthContext.Provider value={{ user, login, logout, ready }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
