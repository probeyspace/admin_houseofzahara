import api from "../Api/api";

export const createProduct = async (productData) => {
  try {
    const response = await api.post("/products", productData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchProducts = async () => {
  try {
    const response = await api.get("/products/admin");
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

export const createVariant = async (productId, variantData) => {
  try {
    const response = await api.post(
      `/products/${productId}/add-variant`,
      variantData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteVariantById = async (variantId) => {
  try {
    const response = await api.delete(`/products/variant/${variantId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const editVariantById = async (id, data) => {
  try {
    const response = await api.put(`/products/variant/${id}`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteVariantImageById = async (variantId, imageId) => {
  try {
    const response = await api.delete(
      `/products/variant/${variantId}/image/${imageId}`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateProduct = async (id, productData) => {
  try {
    const response = await api.put(`/products/${id}`, productData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteProductById = async (id) => {
  try {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const toggleProductActive = async (id, isActive) => {
  try {
    const response = await api.patch(`/products/${id}/toggle-active`, {
      isActive,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const toggleProductPublish = async (id, isPublished) => {
  try {
    const response = await api.patch(`/products/${id}/toggle-publish`, {
      isPublished,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
