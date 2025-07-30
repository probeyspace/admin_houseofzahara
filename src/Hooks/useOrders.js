import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import api from "../Api/api";
import { setOrders } from "../store/slices/orderSlice";

const useOrders = () => {
  const dispatch = useDispatch();
  const user = useSelector((store) => store.user);
  const isAdmin = user?.role === "ADMIN";
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        //check role and fetch products accordingly if admin then fetch all products else fetch only vendor products
        let endpoint = isAdmin ? "/orders/all" : "/orders/vendor";
        const response = await api.get(endpoint);
        // console.log(response.data.data); 
        dispatch(setOrders(response.data.data));
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    fetchOrders();
  }, [dispatch]);
};

export default useOrders;
