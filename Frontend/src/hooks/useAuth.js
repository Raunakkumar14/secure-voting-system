import { useState, useEffect } from "react";
import { authService } from "./authService";

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore user from localStorage on component mount
    const storedUser = authService.getUser();
    if (storedUser) {
      setUser(storedUser);
    }
    setLoading(false);
  }, []);

  const login = (token, userData) => {
    authService.saveAuth(token, userData);
    setUser(userData);
  };

  const logout = () => {
    authService.clearAuth();
    setUser(null);
  };

  return {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
  };
};
