import { toast } from "react-toastify";
import api from "../Api/api";

export const loginUser = async (userData) => {
  try {
    const response = await api.post("/users/login", userData);
    return response.data.data;
  } catch (error) {
    toast.error(error?.response?.data?.message);
    console.log(error?.response?.data?.message);
  }
};

export const registerUser = async (userData) => {
  try {
    const response = await api.post("/users/register", userData);
    return response.data.data;
  } catch (error) {
    toast.error(error?.response?.data?.message);
    console.log(error?.response?.data?.message);
  }
};

export const fetchCurrentUser = async () => {
  try {
    const response = await api.get("/users/current-user");
    return response.data.data;
  } catch (error) {
    console.log(error?.response?.data?.message);
  }
};

export const logoutUser = async () => {
  const response = await api.post("/users/logout");
  return response.status === 200;
};

export const getAllSearchLogs = async () => {
  try {
    const response = await api.get("/searchLogs");
    return response.data.data;
  } catch (error) {
    console.log(error?.response?.data?.message);
  }
};
