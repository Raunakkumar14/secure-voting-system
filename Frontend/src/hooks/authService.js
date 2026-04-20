// Local storage keys
const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

export const authService = {
  // Save token and user
  saveAuth: (token, user) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  // Get token
  getToken: () => {
    return localStorage.getItem(TOKEN_KEY);
  },

  // Get user
  getUser: () => {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  },

  // Check if authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem(TOKEN_KEY);
  },

  // Clear auth data (logout)
  clearAuth: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  // Get auth header
  getAuthHeader: () => {
    const token = localStorage.getItem(TOKEN_KEY);
    return token ? { Authorization: `Bearer ${token}` } : {};
  },
};
