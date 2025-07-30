import { useEffect, useState } from "react";
import api from "../Api/api";

export const useArtisan = () => {
  const [artisans, setArtisans] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchArtisans = async () => {
    setLoading(true);
    try {
      const response = await api.get("/artisan");
      setArtisans(response.data.data);
      setLoading(false);
    } catch (error) {
      setError(error);
      setLoading(false);
    }
  };

  const createArtisan = async (formData) => {
    try {
      const response = await api.post("/artisan", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      await fetchArtisans();
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const deleteArtisan = async (id) => {
    try {
      await api.delete(`/artisan/${id}`);
      await fetchArtisans();
    } catch (error) {
      throw error;
    }
  };

  useEffect(() => {
    fetchArtisans();
  }, []);

  return {
    artisans,
    setArtisans,
    fetchArtisans,
    createArtisan,
    deleteArtisan,
    loading,
    error,
  };
};
