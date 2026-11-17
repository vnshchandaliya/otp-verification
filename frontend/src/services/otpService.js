import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const sendOTP = async (email) => {
  const { data } = await API.post("/send", { email });
  return data;
};

export const verifyOTP = async (email, otp) => {
  const { data } = await API.post("/verify", { email, otp });
  return data;
};