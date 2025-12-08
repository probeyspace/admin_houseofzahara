import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { updateProduct } from "../../services/products";
import SvgSpinner from "../../common/SvgSpinner";
import { updateProductData } from "../../store/slices/productSlice";

const EditProductModal = ({ isOpen, onClose, productData }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: { en: "", ar: "" }, // Bilingual description
    brandName: "",
    productType: "",
    masterCategory: "",
    category: "",
    subcategory: "",
    thumbnails: [],
    video: null,
    YTVideoUrl: "",
    attributes: "[]", // stringified for submission
    attributesObj: {}, // for dynamic rendering
  });
  const [loading, setLoading] = useState(false);
  const [activeLanguage, setActiveLanguage] = useState("en"); // Language tab state
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
          // Handle both old format (string) and new format ({en, ar})
          if (typeof attr.value === "string") {
            // Try to parse as JSON first
            try {
              const parsed = JSON.parse(attr.value);
              if (typeof parsed === "object" && (parsed.en || parsed.ar)) {
                // Successfully parsed JSON with en/ar keys
                attributesObj[attr.key] = {
                  en: parsed.en || "",
                  ar: parsed.ar || "",
                };
              } else {
                // Old format - plain string
                attributesObj[attr.key] = { en: attr.value, ar: "" };
              }
            } catch (e) {
              // Not valid JSON - old format
              attributesObj[attr.key] = { en: attr.value, ar: "" };
            }
          } else if (typeof attr.value === "object") {
            // New format - already {en, ar}
            attributesObj[attr.key] = attr.value;
          }
        }
      });
    }

    // Handle description - support both old (string) and new ({en, ar})
    let descriptionObj = { en: "", ar: "" };
    if (productData?.description) {
      if (typeof productData.description === "string") {
        // Try to parse as JSON first (in case backend stored it as stringified JSON)
        try {
          const parsed = JSON.parse(productData.description);
          if (typeof parsed === "object" && (parsed.en || parsed.ar)) {
            // Successfully parsed JSON with en/ar keys
            descriptionObj = { en: parsed.en || "", ar: parsed.ar || "" };
          } else {
            // Old format - plain string
            descriptionObj = { en: productData.description, ar: "" };
          }
        } catch (e) {
          // Not valid JSON - old format, plain string
          descriptionObj = { en: productData.description, ar: "" };
        }
      } else if (typeof productData.description === "object") {
        // New format - already {en, ar}
        descriptionObj = productData.description;
      }
    }

    if (isOpen && productData) {
      setFormData({
        name: productData.name || "",
        description: descriptionObj,
        brandName: productData.brandName || "",
        productType: productData.productType || "",
        masterCategory:
          productData.masterCategory?._id || productData.masterCategory || "",
        category: productData.category?._id || productData.category || "",
        subcategory:
          productData.subcategory?._id || productData.subcategory || "",
        thumbnails: [],
        video: null,
        YTVideoUrl: productData.YTVideoUrl || "",
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

    // Send description as JSON string with {en, ar}
    data.append("description", JSON.stringify(formData.description));

    data.append("brandName", formData.brandName);
    data.append("productType", formData.productType);
    data.append("masterCategory", formData.masterCategory);
    data.append("category", formData.category);
    data.append("subcategory", formData.subcategory);

    // Optional attributes (JSON string expected) - with bilingual support
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

    // Append YouTube URL for How to Use section
    if (formData.YTVideoUrl) {
      data.append("YTVideoUrl", formData.YTVideoUrl);
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

          {/* Language Tab Switcher */}
          <div className="flex gap-2 border-b border-gray-300 mb-4">
            <button
              type="button"
              onClick={() => setActiveLanguage("en")}
              className={`px-4 cursor-pointer py-2 font-medium transition-colors ${
                activeLanguage === "en"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => setActiveLanguage("ar")}
              className={`px-4 cursor-pointer py-2 font-medium transition-colors ${
                activeLanguage === "ar"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Arabic
            </button>
          </div>

          {/* Description - Bilingual */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description ({activeLanguage === "en" ? "English" : "Arabic"})
            </label>
            <textarea
              name="description"
              placeholder={`Enter description in ${
                activeLanguage === "en" ? "English" : "Arabic"
              }`}
              value={formData.description[activeLanguage]}
              onChange={(e) => {
                setFormData((prev) => ({
                  ...prev,
                  description: {
                    ...prev.description,
                    [activeLanguage]: e.target.value,
                  },
                }));
              }}
              className="w-full border p-2 rounded"
              rows={4}
            ></textarea>
          </div>
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
              Additional Info ({activeLanguage === "en" ? "English" : "Arabic"})
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
                  value={formData.attributesObj?.[key]?.[activeLanguage] || ""}
                  onChange={(e) => {
                    const newAttributes = { ...(formData.attributesObj || {}) };
                    if (!newAttributes[key]) {
                      newAttributes[key] = { en: "", ar: "" };
                    }
                    newAttributes[key][activeLanguage] = e.target.value;
                    setFormData((prev) => ({
                      ...prev,
                      attributesObj: newAttributes,
                      attributes: JSON.stringify(
                        Object.entries(newAttributes).map(([k, v]) => ({
                          key: k,
                          value: v, // v is now {en, ar}
                        }))
                      ),
                    }));
                  }}
                  className="w-full border p-2 rounded"
                  placeholder={`Enter ${label} in ${
                    activeLanguage === "en" ? "English" : "Arabic"
                  }`}
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              YouTube Video URL (How to Use)
              <span className="text-xs text-gray-500 ml-2">
                Optional - Paste YouTube video link for usage instructions
              </span>
            </label>
            {productData?.YTVideoUrl && (
              <div className="mb-2 text-sm text-gray-600 bg-gray-100 p-2 rounded">
                Current:{" "}
                <a
                  href={productData.YTVideoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  {productData.YTVideoUrl}
                </a>
              </div>
            )}
            <input
              type="url"
              name="YTVideoUrl"
              placeholder="https://www.youtube.com/watch?v=..."
              value={formData.YTVideoUrl}
              onChange={handleChange}
              className="w-full border border-gray-300 px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-400"
            />
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
