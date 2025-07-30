import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setProduct } from "../store/slices/productSlice";
import { fetchProducts } from "../services/products";

export default function useProducts() {
  const dispatch = useDispatch();
  useEffect(() => {
    const allProduct = async () => {
      try {
        const productRes = await fetchProducts();
        dispatch(setProduct(productRes));
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    allProduct();
  }, [dispatch]);
}
