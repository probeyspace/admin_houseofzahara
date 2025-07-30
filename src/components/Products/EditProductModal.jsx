import React, { useState, useEffect } from "react";
import { updateProduct } from "../../services/products";
import SvgSpinner from "../../common/SvgSpinner";
import ProductDetails from "./ProductDetails";
import { useDispatch, useSelector } from "react-redux";
import { useCategory } from "../../Hooks/useCategory";
import { toast } from "react-toastify";
import { updateProductData } from "../../store/slices/productSlice";

const EditProductModal = ({ isOpen, onClose, product }) => {
  const [productData, setProductData] = useState({
    name: "",
    description: "",
    brandName: "",
    productType: "",
    department: "",
    categoryId: "",
    weights: [],
    images: [],
  });

  const [nutrition, setNutrition] = useState({
    calories: "",
    protein: "",
    calBenchmark: "",
  });

  const handleNutritionChange = (e) => {
    const { name, value } = e.target;
    setNutrition((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  useCategory();
  const categories = useSelector((store) => store.category);

  useEffect(() => {
    if (product) {
      setProductData({
        name: product.name || "",
        description: product.description || "",
        brandName: product.brandName || "",
        productType: product.productType || "",
        department: product.department || "",
        categoryId: product.categoryId || "",
        weights: product.weights || [],
        images: [],
      });

      console.log(product.nutrition);

      setNutrition({
        calories: product.Nutrition?.calories || "",
        protein: product.Nutrition?.protein || "",
        calBenchmark: product.Nutrition?.calBenchmark || "",
      });
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProductData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleWeightChange = (index, field, value) => {
    const updatedWeights = [...productData.weights];
    updatedWeights[index][field] = value;
    setProductData((prev) => ({ ...prev, weights: updatedWeights }));
  };

  const addWeight = () => {
    setProductData((prev) => ({
      ...prev,
      weights: [
        ...prev.weights,
        { weight: "", sku: "", stock: 0, price: 0, discountPrice: 0 },
      ],
    }));
  };

  const removeWeight = (index) => {
    const updated = productData.weights.filter((_, i) => i !== index);
    setProductData((prev) => ({ ...prev, weights: updated }));
  };

  const handleImageChange = (e) => {
    setProductData((prev) => ({
      ...prev,
      images: Array.from(e.target.files),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("name", productData.name);
    formData.append("description", productData.description);
    formData.append("brandName", productData.brandName);
    formData.append("productType", productData.productType);
    formData.append("department", productData.department);
    formData.append("categoryId", productData.categoryId);
    formData.append("weights", JSON.stringify(productData.weights));
    formData.append("nutrition", JSON.stringify(nutrition));
    productData.images.forEach((image) => {
      formData.append("images", image);
    });

    try {
      const res = await updateProduct(product.id, formData);
      dispatch(updateProductData(res.data));
      toast.success(res.message || "Product updated successfully!");
      onClose();
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("Failed to update product.");
    }

    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center backdrop-blur-md bg-white/30 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-[900px] max-w-full max-h-[90vh] overflow-auto">
        <h2 className="text-xl font-bold mb-4">Edit Product</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <ProductDetails
            productData={productData}
            handleChange={handleChange}
            categories={categories}
          />

          {/* Weight Variants */}
          <div className="border p-4 rounded">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-medium">Weight Variants</h4>
              <button
                type="button"
                onClick={addWeight}
                className="text-blue-500 text-sm"
              >
                + Add Weight
              </button>
            </div>
            {productData.weights.map((w, idx) => (
              <div key={idx} className="grid grid-cols-6 gap-2 mb-2 items-end">
                <input
                  type="text"
                  placeholder="Weight"
                  value={w.weight}
                  onChange={(e) =>
                    handleWeightChange(idx, "weight", e.target.value)
                  }
                  className="border p-2 rounded"
                />
                <input
                  type="text"
                  placeholder="SKU"
                  value={w.sku}
                  onChange={(e) =>
                    handleWeightChange(idx, "sku", e.target.value)
                  }
                  className="border p-2 rounded"
                />
                <input
                  type="number"
                  placeholder="Stock"
                  value={w.stock}
                  onChange={(e) =>
                    handleWeightChange(idx, "stock", e.target.value)
                  }
                  className="border p-2 rounded"
                />
                <input
                  type="number"
                  placeholder="Price"
                  value={w.price}
                  onChange={(e) =>
                    handleWeightChange(idx, "price", e.target.value)
                  }
                  className="border p-2 rounded"
                />
                <input
                  type="number"
                  placeholder="Discount Price"
                  value={w.discountPrice}
                  onChange={(e) =>
                    handleWeightChange(idx, "discountPrice", e.target.value)
                  }
                  className="border p-2 rounded"
                />
                <button
                  type="button"
                  onClick={() => removeWeight(idx)}
                  className="text-red-600 text-sm"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          {/* Nutrition Info */}
          <div className="border p-4 rounded">
            <h3 className="text-lg font-semibold">
              Add Nutrition Info{" "}
              <span className="text-sm text-gray-500">
                (per 100g of product)
              </span>
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {["calories", "protein"].map((key) => (
                <div className="flex items-center space-x-2" key={key}>
                  <input
                    type="number"
                    name={key}
                    value={nutrition[key]}
                    onChange={handleNutritionChange}
                    className="border p-2 rounded w-full"
                    placeholder={key}
                  />
                  <span>{key === "calories" ? "kCal" : "gm"}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="border p-4 rounded space-y-4">
            <h3 className="text-lg font-semibold">
              Calories benchmark for comparison{" "}
              <span className="text-sm text-gray-500">
                (per 100g of product)
              </span>
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  name="calBenchmark"
                  placeholder="Benchmark of calories"
                  value={nutrition.calBenchmark}
                  onChange={handleNutritionChange}
                  className="border p-2 rounded w-full"
                />
                <span>kCal</span>
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Product Images
            </label>
            <input
              type="file"
              name="images"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              className="border border-gray-300 px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-400 w-full"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded flex-1"
              disabled={loading}
            >
              {loading ? <SvgSpinner /> : "Update Product"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-400 text-dark px-4 py-2 rounded flex-1"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProductModal;
