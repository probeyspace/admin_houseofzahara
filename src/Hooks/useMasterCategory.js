import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { fetchAllMasterCategory } from "../services/masterCategory";
import { setMasterCategory } from "../store/slices/masterSlice";

export const useMasterCategory = () => {
  const dispatch = useDispatch();
  const masterCategory = useSelector((store) => store.masterCategory);
  const getAllMasterCategory = async () => {
    try {
      if (!masterCategory) {
        const fetched = await fetchAllMasterCategory();
        dispatch(setMasterCategory(fetched));
      }
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    getAllMasterCategory();
  }, [dispatch]);
};
