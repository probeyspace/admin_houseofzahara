import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { updateProduct } from "../../services/products";
import SvgSpinner from "../../common/SvgSpinner";
import { updateProductData } from "../../store/slices/productSlice";

const EditProductModal = ({ isOpen, onClose, productData }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    brandName: "",
    productType: "",
    masterCategory: "",
    category: "",
    subcategory: "",
    thumbnails: [],
    video: null,
    attributes: "[]", // stringified for submission
    attributesObj: {}, // for dynamic rendering
  });
  const [loading, setLoading] = useState(false);
  const categories = useSelector((state) => state.category);
  const subcategories = useSelector((state) => state.subCategory);
  const masterCategories = useSelector((state) => state.masterCategory);
  const dispatch = useDispatch();

  // Populate existing product data when modal opens
  useEffect(() => {
    // Convert attributes array to key-value map for input prefill
    const attributesObj = {};
    if (productData?.attributes?.length > 0) {
      productData?.attributes.forEach((attr) => {
        if (attr.key && attr.value) {
          attributesObj[attr.key] = attr.value;
        }
      });
    }

    if (isOpen && productData) {
      setFormData({
        name: productData.name || "",
        description: productData.description || "",
        brandName: productData.brandName || "",
        productType: productData.productType || "",
        masterCategory:
          productData.masterCategory?._id || productData.masterCategory || "",
        category: productData.category?._id || productData.category || "",
        subcategory:
          productData.subcategory?._id || productData.subcategory || "",
        thumbnails: [],
        attributes: JSON.stringify(productData.attributes || []), // ✅ stringify here
        attributesObj: attributesObj, // for dynamic rendering
      });
    }
  }, [isOpen, productData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const filteredCategories = categories.filter(
    (cat) => cat.masterCategory?._id === formData.masterCategory
  );

  const filteredSubcategories = subcategories.filter(
    (sub) => sub.category?._id === formData.category
  );

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 2) {
      toast.error("Only 2 thumbnail images are allowed.");
      return;
    }
    setFormData((prev) => ({ ...prev, thumbnails: files }));
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size > 50 * 1024 * 1024) {
      toast.error("Video file size must be less than 50MB.");
      return;
    }
    setFormData((prev) => ({ ...prev, video: file }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    data.append("name", formData.name);
    data.append("description", formData.description);
    data.append("brandName", formData.brandName);
    data.append("productType", formData.productType);
    data.append("masterCategory", formData.masterCategory);
    data.append("category", formData.category);
    data.append("subcategory", formData.subcategory);

    // Optional attributes (JSON string expected)
    if (formData.attributes) {
      data.append("attributes", formData.attributes);
    }

    formData.thumbnails.forEach((file) => {
      data.append("thumbnails", file);
    });

    // Append video if provided
    if (formData.video) {
      data.append("video", formData.video);
    }

    try {
      const response = await updateProduct(productData._id, data);
      dispatch(updateProductData(response.data)); // Redux update
      toast.success(response?.message || "Product updated successfully.");
      onClose();
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to update product."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-black/30 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-[600px] max-w-full max-h-[90vh] overflow-y-auto">
        <div className="relative">
          <h2 className="text-xl font-bold mb-4">Edit Product</h2>
          <button
            onClick={onClose}
            className="absolute top-1 right-1 text-gray-500 hover:text-gray-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
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
            rows={4}
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
            name="masterCategory"
            value={formData.masterCategory}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          >
            <option value="">Select Master Category</option>
            {masterCategories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>

          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          >
            <option value="">Select Category</option>
            {filteredCategories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>

          <select
            name="subcategory"
            value={formData.subcategory}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          >
            <option value="">Select Subcategory</option>
            {filteredSubcategories.map((sub) => (
              <option key={sub._id} value={sub._id}>
                {sub.name}
              </option>
            ))}
          </select>

          {/* Attributes field (JSON string) */}
          <div className="space-y-2">
            <label className="block font-medium text-sm text-gray-700">
              Additional Info
            </label>
            {[
              { key: "Usage", label: "Usage Instructions" },
              { key: "Ingredients", label: "Ingredients" },
              { key: "Highlights", label: "Highlights" },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="text-sm text-gray-600">{label}</label>
                <input
                  type="text"
                  name={`attribute-${key}`}
                  value={formData.attributesObj?.[key] || ""}
                  onChange={(e) => {
                    const newAttributes = { ...(formData.attributesObj || {}) };
                    newAttributes[key] = e.target.value;
                    setFormData((prev) => ({
                      ...prev,
                      attributesObj: newAttributes,
                      attributes: JSON.stringify(
                        Object.entries(newAttributes).map(([k, v]) => ({
                          key: k,
                          value: v,
                        }))
                      ),
                    }));
                  }}
                  className="w-full border p-2 rounded"
                  placeholder={`Enter ${label}`}
                />
              </div>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Replace Thumbnails (optional, max 2)
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              className="border border-gray-300 px-3 py-2 rounded-md w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Video (Optional)
            </label>
            {productData?.videoUrl && (
              <div className="mb-2 text-sm text-gray-600 bg-gray-100 p-2 rounded">
                Current:{" "}
                <a
                  href={productData.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  View Video
                </a>
              </div>
            )}
            <input
              type="file"
              accept="video/mp4,video/webm,video/quicktime"
              onChange={handleVideoChange}
              className="border border-gray-300 px-3 py-2 rounded-md w-full"
            />
            <p className="text-xs text-gray-500 mt-1">
              Upload new video to replace existing one (MP4, WebM, MOV | Max
              50MB)
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-primary text-dark px-4 py-2 rounded flex-1 cursor-pointer"
              disabled={loading}
            >
              {loading ? <SvgSpinner /> : "Update Product"}
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

export default EditProductModal;
