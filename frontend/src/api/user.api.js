import api from "./axios.js";

export const registerUser = (data) => 
    api.post("/api/v1/users/register", data);

export const loginUser = (data) => 
    api.post("/api/v1/users/login", data);

export const forgotPassword = (data) => 
    api.post("/api/v1/users/forgot-password", data);

export const resetPassword = (token, data) => 
    api.post(`/api/v1/users/reset-password/${token}`, data);