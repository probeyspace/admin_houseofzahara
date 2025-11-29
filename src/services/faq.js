import api from "../Api/api";

// Get all FAQs for a product
export const fetchFAQsByProduct = async (productId) => {
  try {
    const response = await api.get(`/products/${productId}/faqs`);
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

// Create new FAQ
export const createFAQ = async (productId, faqData) => {
  try {
    const response = await api.post(`/products/${productId}/faqs`, faqData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update FAQ
export const updateFAQ = async (faqId, faqData) => {
  try {
    const response = await api.put(`/products/faq/${faqId}`, faqData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Delete FAQ
export const deleteFAQ = async (faqId) => {
  try {
    const response = await api.delete(`/products/faq/${faqId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
