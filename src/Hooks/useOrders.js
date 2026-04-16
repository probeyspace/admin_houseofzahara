import { useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";
import api from "../Api/api";
import { setOrders } from "../store/slices/orderSlice";

const useOrders = () => {
  const dispatch = useDispatch();

  const fetchOrders = useCallback(async () => {
    try {
      const response = await api.get("/orders/all");
      dispatch(setOrders(response.data.data));
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  }, [dispatch]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return { refetch: fetchOrders };
};

export default useOrders;
