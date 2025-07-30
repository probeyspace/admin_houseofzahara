import { useEffect, useState } from "react";
import api from "../Api/api";

export const useTestimonial = () => {
  const [testimonials, setTestimonials] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTestimonials = async () => {
    setLoading(true);
    try {
      const response = await api.get("/testimonials");
      setTestimonials(response.data.data);
    } catch (error) {
      setError(error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  return { testimonials, setTestimonials, fetchTestimonials, loading, error };
};
