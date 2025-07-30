import { useState } from "react";
import { addProduct } from "../../services/products";
import { useDispatch, useSelector } from "react-redux";
import { useCategory } from "../../Hooks/useCategory";
import ProductDetails from "./ProductDetails";
import SvgSpinner from "../../common/SvgSpinner";
import { toast } from "react-toastify";
import { addProductData } from "../../store/slices/productSlice";

const CreateProduct = () => {
  useCategory();
  const categories = useSelector((store) => store.category);
  const dispatch = useDispatch();
  const [productData, setProductData] = useState({
    name: "",
    description: "",
    brandName: "",
    productType: "",
    department: "",
    categoryId: "",
    weights: [],
  });
  const [nutrition, setNutrition] = useState({
    calories: "",
    protein: "",
    calBenchmark: "",
  });

  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const handleNutritionChange = (e) => {
    const { name, value } = e.target;
    setNutrition((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProductData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleWeightChange = (index, field, value) => {
    const updatedWeights = [...productData.weights];
    updatedWeights[index][field] = value;
    setProductData({ ...productData, weights: updatedWeights });
  };

  const addWeight = () => {
    setProductData((prev) => ({
      ...prev,
      weights: [
        ...prev.weights,
        { weight: "", sku: "", stock: "", price: "", discountPrice: "" },
      ],
    }));
  };

  const removeWeight = (index) => {
    const updated = [...productData.weights];
    updated.splice(index, 1);
    setProductData({ ...productData, weights: updated });
  };

  const handleImageChange = (e) => {
    setImages([...e.target.files]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();

    // Append basic product fields
    formData.append("name", productData.name);
    formData.append("description", productData.description);
    formData.append("brandName", productData.brandName);
    formData.append("productType", productData.productType);
    formData.append("department", productData.department);
    formData.append("categoryId", productData.categoryId);

    // Append weights
    formData.append("weights", JSON.stringify(productData.weights));
    // Append nutrition
    formData.append("nutrition", JSON.stringify(nutrition));
    // Append images
    images.forEach((image) => {
      formData.append("images", image);
    });

    try {
      const res = await addProduct(formData);
      toast.success(res.message || "Product created successfully!");
      // UPDATE IN REDUX STORE
      dispatch(addProductData(res.data));
      setProductData({
        name: "",
        description: "",
        brandName: "",
        productType: "",
        department: "",
        categoryId: "",
        weights: [],
      });
      setNutrition({
        calories: "",
        protein: "",
        calBenchmark: "",
      });

      setImages([]);
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Something went wrong!");
    }

    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-6">
      <h2 className="text-3xl font-bold text-center mb-6">
        Create New Product
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <ProductDetails
          productData={productData}
          handleChange={handleChange}
          categories={categories}
        />

        <div className="border p-4 rounded space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Weight Variants</h3>
            <button
              type="button"
              onClick={addWeight}
              className="bg-primary hover:bg-primary/80 text-white px-3 py-1 rounded cursor-pointer"
            >
              + Add Weight
            </button>
          </div>

          {productData.weights.map((weight, index) => (
            <div key={index} className="grid grid-cols-6 gap-4 items-end">
              <input
                type="text"
                placeholder="Weight"
                value={weight.weight}
                onChange={(e) =>
                  handleWeightChange(index, "weight", e.target.value)
                }
                className="border p-2 rounded col-span-1"
              />
              <input
                type="text"
                placeholder="SKU"
                value={weight.sku}
                onChange={(e) =>
                  handleWeightChange(index, "sku", e.target.value)
                }
                className="border p-2 rounded col-span-1"
              />
              <input
                type="number"
                placeholder="Stock"
                value={weight.stock}
                onChange={(e) =>
                  handleWeightChange(index, "stock", e.target.value)
                }
                className="border p-2 rounded col-span-1"
              />
              <input
                type="number"
                placeholder="Price"
                value={weight.price}
                onChange={(e) =>
                  handleWeightChange(index, "price", e.target.value)
                }
                className="border p-2 rounded col-span-1"
              />
              <input
                type="number"
                placeholder="Discount Price"
                value={weight.discountPrice}
                onChange={(e) =>
                  handleWeightChange(index, "discountPrice", e.target.value)
                }
                className="border p-2 rounded col-span-1"
              />
              <button
                type="button"
                onClick={() => removeWeight(index)}
                className="bg-red-500 text-white px-2 py-1 rounded col-span-1"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <div className="border p-4 rounded space-y-4">
          <h3 className="text-lg font-semibold">
            Add Nutrition Info{" "}
            <span className="text-sm text-gray-500">(per 100g of product)</span>
          </h3>
          <div className="grid grid-cols-2 gap-4">
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
            <span className="text-sm text-gray-500">(per 100g of product)</span>
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
        <button
          type="submit"
          className="px-10 bg-primary hover:bg-primary/80 text-white py-2 rounded text-lg flex items-center justify-center cursor-pointer"
          disabled={loading}
        >
          {loading ? <SvgSpinner /> : "Create Product"}
        </button>
      </form>
    </div>
  );
};

export default CreateProduct;
