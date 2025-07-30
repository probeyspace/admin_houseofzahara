import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { fetchAllCategory } from "../services/category";
import { allCategory } from "../store/slices/categorySlice";

export const useCategory = () => {
  const dispatch = useDispatch();
  const categories = useSelector((store) => store.category);

  const getAllCategory = async () => {
    try {
      if (!categories) {
        const fetchedCategory = await fetchAllCategory();

        dispatch(allCategory(fetchedCategory));
      }
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    getAllCategory();
  }, [dispatch]);
};
