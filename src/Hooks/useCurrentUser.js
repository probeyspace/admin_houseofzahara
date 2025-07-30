// hooks/useCurrentUser.js
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { fetchCurrentUser } from "../services/auth";
import { addUser } from "../store/slices/userSlice";

export const useCurrentUser = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const fetchedUser = await fetchCurrentUser();
        // console.log("Fetched User:", fetchedUser);
        if (fetchedUser.role) {
          dispatch(addUser(fetchedUser));
          navigate("/"); // Redirect to home page after fetching user
        } else {
          throw new Error("User does not have a role");
        }
      } catch (error) {
        console.error("User not authenticated", error);
        navigate("/login");
      }
    };

    getCurrentUser();
  }, []); // only run on mount
};
