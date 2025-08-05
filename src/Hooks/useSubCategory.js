import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { setSubCategory } from "../store/slices/subCategorySlice";
import { fetchAllSubCategory } from "../services/subCategories";

export const useSubCategory = () => {
  const dispatch = useDispatch();
  const subCategories = useSelector((store) => store.subCategory);

  const getAllCategory = async () => {
    try {
      if (!subCategories) {
        const fetched = await fetchAllSubCategory();
        dispatch(setSubCategory(fetched));
      }
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    getAllCategory();
  }, [dispatch]);
};
