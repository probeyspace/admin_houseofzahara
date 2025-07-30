import { useEffect, useState } from "react";
import api from "../Api/api";

export const useBanner = () => {
  const [banners, setBanners] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchBanner = async () => {
    setLoading(true);
    try {
      const response = await api.get("/banner");
      setBanners(response.data.data);
      setLoading(false);
    } catch (error) {
      setError(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanner();
  }, []);

  return { banners, setBanners, fetchBanner, loading, error };
};
