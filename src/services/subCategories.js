import api from "../Api/api";

export const fetchAllSubCategory = async () => {
  try {
    const response = await api.get("/subcategories");
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

export const createSubCategory = async (categoryData) => {
  try {
    const response = await api.post("/subcategories", categoryData);
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

export const updateSubCategoryById = async (id, updatedCategoryData) => {
  try {
    const response = await api.put(`/subcategories/${id}`, updatedCategoryData);
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

export const deleteSubCategoryById = async (id) => {
  try {
    const response = await api.delete(`/subcategories/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
