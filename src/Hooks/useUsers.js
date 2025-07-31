import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import api from "../Api/api";
import { setUsers } from "../store/slices/usersSlice";

export default function useUsers() {
  const dispatch = useDispatch();
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get("/users/all-users");
        dispatch(setUsers(res.data.data));
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, [dispatch]);
}
