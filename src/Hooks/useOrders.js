import { useEffect } from "react";
import { useDispatch } from "react-redux";
import api from "../Api/api";
import { setOrders } from "../store/slices/orderSlice";

const useOrders = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get("/orders/all");
        dispatch(setOrders(response.data.data));
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    fetchOrders();
  }, [dispatch]);
};

export default useOrders;
