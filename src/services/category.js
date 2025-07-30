import { toast } from "react-toastify";
import api from "../Api/api";

export const fetchAllCategory = async () => {
  try {
    const response = await api.get("/categories");
    return response.data.data;
  } catch (error) {
    console.log(error);
  }
};

export const createCategory = async (categoryData) => {
  try {
    const response = await api.post("/categories", categoryData);
    return response.data.data;
  } catch (error) {
    console.log(error?.response?.data?.message);
  }
};

export const updateCategory = async (id, updatedCategoryData) => {
  try {
    const response = await api.put(`/categories/${id}`, updatedCategoryData);
    return response.data.data;
  } catch (error) {
    console.log(error);
  }
};
