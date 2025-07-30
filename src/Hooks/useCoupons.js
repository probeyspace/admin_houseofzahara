import { useEffect, useState } from "react";
import api from "../Api/api";

export const useCoupons = () => {
  const [coupons, setCoupons] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const response = await api.get("/promoCode");
      setCoupons(response.data.data);
      setLoading(false);
    } catch (error) {
      setError(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  return { coupons, loading, setCoupons, error, fetchCoupons };
};
