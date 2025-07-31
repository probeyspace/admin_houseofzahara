import { useState } from "react";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { createProduct } from "../../services/products";
import SvgSpinner from "../../common/SvgSpinner";
import { addProductData } from "../../store/slices/productSlice";

const AddProductModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    brandName: "",
    productType: "",
    categoryId: "",
    thumbnails: [],
  });
  const [loading, setLoading] = useState(false);
  const categories = useSelector((state) => state.category);
  const dispatch = useDispatch();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 2) {
      toast.error("Only 2 thumbnail images are allowed.");
      return;
    }
    setFormData((prev) => ({ ...prev, thumbnails: files }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    data.append("name", formData.name);
    data.append("description", formData.description);
    data.append("brandName", formData.brandName);
    data.append("productType", formData.productType);
    data.append("categoryId", formData.categoryId);
    formData.thumbnails.forEach((file) => {
      data.append("thumbnails", file);
    });

    try {
      const response = await createProduct(data);
      dispatch(addProductData(response.data));
      toast.success(response?.message || "Product created successfully.");
      onClose();
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to create product."
      );
    }

    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-black/30 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-[600px] max-w-full">
        <h2 className="text-xl font-bold mb-4">Add Product</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Product Name"
            value={formData.name}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />
          <textarea
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          ></textarea>
          <input
            type="text"
            name="brandName"
            placeholder="Brand Name"
            value={formData.brandName}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />
          <input
            type="text"
            name="productType"
            placeholder="Product Type"
            value={formData.productType}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
          <select
            name="categoryId"
            value={formData.categoryId}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Thumbnail Images (Max 2)
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              className="border border-gray-300 px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-400 w-full"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-primary text-dark px-4 py-2 rounded flex-1 cursor-pointer"
              disabled={loading}
            >
              {loading ? <SvgSpinner /> : "Create Product"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-400 text-dark px-4 py-2 rounded flex-1 cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductModal;
