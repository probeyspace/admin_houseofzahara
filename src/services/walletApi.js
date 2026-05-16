import api from "../Api/api";

export const fetchAllWallets = (page = 1, limit = 20) =>
  api.get(`/wallet/admin/all?page=${page}&limit=${limit}`).then((r) => r.data.data);

export const fetchUserWallet = (userId) =>
  api.get(`/wallet/admin/${userId}`).then((r) => r.data.data);

export const manualAdjustPoints = (userId, points, description) =>
  api.post("/wallet/admin/adjust", { userId, points, description }).then((r) => r.data.data);

export const fetchAdminWalletConfig = () =>
  api.get("/wallet/admin/config").then((r) => r.data.data);

export const updateAdminWalletConfig = (data) =>
  api.put("/wallet/admin/config", data).then((r) => r.data.data);
