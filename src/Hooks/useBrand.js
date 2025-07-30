import { useEffect, useState } from "react";
import api from "../Api/api";

export const useBrand = () => {
  const [brands, setBrands] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchBrands = async () => {
    setLoading(true);
    try {
      const response = await api.get("/brands");
      setBrands(response.data.data);
      setLoading(false);
    } catch (error) {
      setError(error);
      setLoading(false);
    }
  };

  const createBrand = async (formData) => {
    try {
      const response = await api.post("/brands", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      await fetchBrands();
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const deleteBrand = async (id) => {
    try {
      await api.delete(`/brands/${id}`);
      await fetchBrands();
    } catch (error) {
      throw error;
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  return {
    brands,
    setBrands,
    fetchBrands,
    createBrand,
    deleteBrand,
    loading,
    error,
  };
};
