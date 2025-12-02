import api from "../Api/api";

export const fetchAllMasterCategory = async () => {
  try {
    const response = await api.get("/master-categories");
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

export const createMasterCategory = async (Data) => {
  try {
    const response = await api.post("/master-categories", Data);
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

export const updateMasterCategory = async (id, data) => {
  try {
    const response = await api.put(`/master-categories/${id}`, data);
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

export const deleteMasterCategory = async (id) => {
  try {
    const response = await api.delete(`/master-categories/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
export const toggleMasterCategory = async (id) => {
  try {
    const response = await api.patch(`/master-categories/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
