import api from "../Api/api";

export const fetchAdminMembershipConfig = () =>
  api.get("/membership/admin/config").then((r) => r.data.data);

export const updateAdminMembershipConfig = (data) =>
  api.put("/membership/admin/config", data).then((r) => r.data.data);

export const fetchAllMemberships = (page = 1, limit = 20, search = "", status = "") => {
  const params = new URLSearchParams({ page, limit });
  if (search) params.set("search", search);
  if (status) params.set("status", status);
  return api.get(`/membership/admin/all?${params}`).then((r) => r.data.data);
};

export const fetchUserMemberships = (userId) =>
  api.get(`/membership/admin/${userId}`).then((r) => r.data.data);

export const adjustMembership = (payload) =>
  api.post("/membership/admin/adjust", payload).then((r) => r.data.data);

export const fetchUnseenMembershipCount = () =>
  api.get("/membership/admin/unseen-count").then((r) => r.data.data.count);

export const markMembershipsSeen = () =>
  api.post("/membership/admin/mark-seen").then((r) => r.data.data);
