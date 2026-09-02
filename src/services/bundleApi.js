import api from "../Api/api";

export const getBundleByProduct = async (productId) => {
  try {
    const response = await api.get(`/bundles/product/${productId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createBundle = async (bundleData) => {
  try {
    const response = await api.post("/bundles", bundleData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateBundle = async (bundleId, bundleData) => {
  try {
    const response = await api.put(`/bundles/${bundleId}`, bundleData);
    return response.data;
  } catch (error) {
    throw error;
  }
};
