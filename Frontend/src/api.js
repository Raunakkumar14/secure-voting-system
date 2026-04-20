import axios from "axios";
import { authService } from "./hooks/authService";

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://127.0.0.1:8000",
});

// Add interceptor to include auth header in all requests
API.interceptors.request.use((config) => {
  const authHeader = authService.getAuthHeader();
  config.headers = { ...config.headers, ...authHeader };
  return config;
});

// Auth
export const registerUser = (data) => API.post("/register", data);
export const loginUser = (data) => API.post("/login", data);

// Voting
export const getCandidates = () => API.get("/candidates");
export const castVote = (candidateId) => API.post("/vote", { candidate_id: candidateId });

// Results + stats
export const getResults = () => API.get("/results");
export const getStats = () => API.get("/stats");

// Email Check
export const checkEmail = (email) => API.post("/check-email", { email });

// OTP
export const sendOtp = (email) => API.post("/send-otp", { email });
export const verifyOtp = (email, otp) => API.post("/verify-otp", { email, otp });
export const resendOtp = (email) => API.post("/resend-otp", { email });

// Forgot Password
export const forgotPassword = (email) => API.post("/forgot-password", { email });
export const verifyResetOtp = (email, otp) => API.post("/verify-reset-otp", { email, otp });
export const resendResetOtp = (email) => API.post("/resend-reset-otp", { email });
export const resetPassword = (email, otp, newPassword) =>
  API.post("/reset-password", { email, otp, new_password: newPassword });

// Admin - Candidate Management
export const createCandidate = (data) => API.post("/admin/candidates", data);
export const updateCandidate = (candidateId, data) => API.put(`/admin/candidates/${candidateId}`, data);
export const deleteCandidate = (candidateId) => API.delete(`/admin/candidates/${candidateId}`);

// Admin - Election Management
export const createElection = (data) => API.post("/admin/elections", data);
export const listElections = () => API.get("/admin/elections");
export const startElection = (electionId) => API.post(`/admin/elections/${electionId}/start`);
export const endElection = (electionId) => API.post(`/admin/elections/${electionId}/end`);
export const getElectionResults = (electionId) => API.get(`/admin/elections/${electionId}/results`);

// User Profile Management
export const getUserProfile = () => API.get("/profile");
export const updateUserProfile = (name, email) => API.put("/profile", null, { params: { name, email } });
export const changePassword = (data) => API.post("/change-password", data);