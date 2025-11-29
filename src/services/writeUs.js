import api from "../Api/api";

// Get all WriteUs inquiries for a product
export const fetchWriteUsByProduct = async (productId, status = null) => {
  try {
    const url = status
      ? `/products/${productId}/write-us?status=${status}`
      : `/products/${productId}/write-us`;
    const response = await api.get(url);
    return response.data.data;
  } catch (error) {
    throw error;
  }
};
