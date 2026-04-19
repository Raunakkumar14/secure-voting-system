import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000",
});

// Auth
export const registerUser = (data) => API.post("/register", data);
export const loginUser = (data) => API.post("/login", data);

// Voting
export const getCandidates = () => API.get("/candidates");
export const castVote = (data) => API.post("/vote", data);

// Results + stats
export const getResults = () => API.get("/results");
export const getStats = () => API.get("/stats");

// Email Check
export const checkEmail = (email) => API.post(`/check-email?email=${encodeURIComponent(email)}`);

// OTP
export const sendOtp = (email) => API.post(`/send-otp?email=${encodeURIComponent(email)}`);
export const verifyOtp = (email, otp) =>
  API.post(`/verify-otp?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(otp)}`);

// Forgot Password
export const forgotPassword = (email) => API.post(`/forgot-password?email=${encodeURIComponent(email)}`);
export const verifyResetOtp = (email, otp) =>
  API.post(`/verify-reset-otp?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(otp)}`);
export const resetPassword = (email, otp, newPassword) =>
  API.post(`/reset-password?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(otp)}&new_password=${encodeURIComponent(newPassword)}`);