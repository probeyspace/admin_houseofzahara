import api from "../Api/api";

export const fetchSeoSettings = async () => {
  const response = await api.get("/seo");
  return response.data.data;
};

export const updateSeoSettings = async (payload) => {
  const response = await api.put("/seo", payload);
  return response.data.data;
};
