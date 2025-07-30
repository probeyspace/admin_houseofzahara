import api from "../Api/api";

export const addProduct = async (productData) => {
  try {
    const response = await api.post("/products", productData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.message || "Something went wrong");
  }
};
export const fetchProducts = async () => {
  try {
    const response = await api.get("/products/admin");
    return response.data.data;
  } catch (error) {
    throw new Error(error);
  }
};

export const updateProduct = async (id, productData) => {
  try {
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
  } catch (error) {
    throw new Error(error);
  }
};
export const deleteProductById = async (id) => {
  try {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error);
  }
};

export const verifyProductById = async (id, isVerified) => {
  try {
    const response = await api.put(`/products/verify/${id}`, { isVerified });
    return response.data.data;
  } catch (error) {
    throw new Error(error);
  }
};

export const fetchCustomers = async () => {
  try {
    const response = await api.get("/vendor/customers");
    return response.data.data;
  } catch (error) {
    throw new Error(error);
  }
};
