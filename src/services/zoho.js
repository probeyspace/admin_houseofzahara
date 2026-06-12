import api from "../Api/api";

export const syncUserToZoho = async (userId) => {
  try {
    const response = await api.post(`/zoho/contacts/sync/${userId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const syncAllUsersToZoho = async () => {
  try {
    const response = await api.post("/zoho/contacts/sync-all");
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const syncVariantToZoho = async (variantId) => {
  try {
    const response = await api.post(`/zoho/items/sync/${variantId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const syncAllVariantsToZoho = async () => {
  try {
    const response = await api.post("/zoho/items/sync-all");
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const syncOrderToZoho = async (orderId) => {
  try {
    const response = await api.post(`/zoho/orders/sync/${orderId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const reconcilePayments = async () => {
  try {
    const response = await api.post("/admin/reconcile-payments");
    return response.data;
  } catch (error) {
    throw error;
  }
};
