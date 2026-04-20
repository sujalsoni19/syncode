import api from "./axios.js";

export const registerUser = (data) => 
    api.post("/api/v1/users/register", data);

export const loginUser = (data) => 
    api.post("/api/v1/users/login", data);