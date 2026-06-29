import { useEffect, useState } from "react";
import { FaCloudUploadAlt } from "react-icons/fa";
import SvgSpinner from "../../common/SvgSpinner";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import {
  createSubCategory,
  updateSubCategoryById,
} from "../../services/subCategories";
import {
  addSubCategory,
  updateLocalSubCategory,
} from "../../store/slices/subCategorySlice";

const EditSubCategoryModal = ({ isOpen, onClose, subCategory }) => {
  const [categoryName, setCategoryName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const dispatch = useDispatch();
  const categories = useSelector((store) => store.category);

  useEffect(() => {
    if (isOpen && subCategory) {
      setCategoryName(subCategory.name || "");
      setSlug(subCategory.slug || "");
      setDescription(subCategory.description || "");
      setSelectedCategory(subCategory.category._id || "");
      setPreview(subCategory.image || null);
      setImage(null); // Reset image selection on open
    }
  }, [isOpen, subCategory]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (!categoryName || !description) {
      toast.error("SubCategory name and description are required");
      setLoading(false);
      return;
    }
    const formData = new FormData();
    formData.append("name", categoryName);
    formData.append("slug", slug);
    formData.append("description", description);
    formData.append("category", selectedCategory);
    if (image) formData.append("image", image);

    try {
      const newCategory = await updateSubCategoryById(
        subCategory._id,
        formData
      );
      toast.success("SubCategory updated successfully");
      setCategoryName("");
      setSlug("");
      setDescription("");
      setImage(null);
      setPreview(null);
      dispatch(updateLocalSubCategory(newCategory));
      onClose(); // close modal after success
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to update subcategory."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/30">
      <div className="bg-white w-full max-w-2xl rounded-lg shadow-lg p-6 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-gray-500 hover:text-gray-700 cursor-pointer text-3xl"
        >
          &times;
        </button>

        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          Edit SubCategory
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Category Name */}

          <div>
            <label className="block text-gray-700 font-medium mb-1">
              SubCategory Name
            </label>
            <input
              type="text"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-md focus:ring focus:ring-blue-300"
              placeholder="Enter subcategory name"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Slug (URL segment)
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-"))}
              required
              className="w-full px-4 py-2 border rounded-md focus:ring focus:ring-blue-300"
              placeholder="subcategory-slug"
            />
          </div>

          {/* Category ... */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-1">
              Select Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:ring focus:ring-blue-300"
            >
              <option className="text-gray-400" value="">
                Select Category
              </option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:ring focus:ring-blue-300"
              placeholder="Enter category description"
              rows="4"
            ></textarea>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Upload Image (Optional)
            </label>
            <div className="flex items-center gap-4">
              <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-md flex items-center gap-2">
                <FaCloudUploadAlt />
                Upload Image
                <input
                  type="file"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </label>
              {preview && (
                <img
                  src={preview}
                  alt="Preview"
                  className="w-16 h-16 rounded-md object-cover border"
                />
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="text-right">
            <button
              type="submit"
              className="bg-primary cursor-pointer hover:scale-105 transition duration-300 text-dark px-4 py-2 rounded-md font-medium"
              disabled={loading}
            >
              {!loading ? "Update SubCategory" : <SvgSpinner />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditSubCategoryModal;
