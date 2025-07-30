import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import api from "../Api/api";
import { setUsers } from "../store/slices/usersSlice";

export default function useUsers() {
  const dispatch = useDispatch();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get("/users/all-users");
        dispatch(setUsers(res.data.data));
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    const fetchVendors = async () => {
      try {
        setLoading(true);
        const res = await api.get("/vendor/admin");
        setVendors(res.data.data);
      } catch (error) {
        console.error("Error fetching vendors:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
    fetchVendors();
  }, [dispatch]);

  return { vendors, loading, setVendors };
}
