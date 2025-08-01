import { useState, useEffect } from "react";
import { FaCloudUploadAlt } from "react-icons/fa";
import { updateCategory } from "../../services/category";
import SvgSpinner from "../../common/SvgSpinner";
import { toast } from "react-toastify";
import { useCategory } from "../../Hooks/useCategory";

const EditCategoryModal = ({ isOpen, onClose, category }) => {
  const [categoryName, setCategoryName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  useCategory();
  // Reset values when modal opens or closes
  useEffect(() => {
    if (isOpen && category) {
      setCategoryName(category.name || "");
      setDescription(category.description || "");
      setPreview(category.image || null);
      setImage(null); // Reset image selection on open
    }
  }, [isOpen, category]);

  if (!isOpen) return null;

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
      toast.error("Category name, description, and image are required.");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("name", categoryName);
    formData.append("description", description);
    if (image) formData.append("image", image);

    try {
      await updateCategory(category._id, formData);
      toast.success("Category updated successfully");
      handleClose(); // this is not async, so no need for await
    } catch (error) {
      console.error(
        error?.response?.data?.message || "Error updating category"
      );
      toast.error(error?.response?.data?.message || "Error updating category");
    } finally {
      setLoading(false); // always stop loading
    }
  };

  const handleClose = () => {
    setCategoryName("");
    setDescription("");
    setPreview(null);
    setImage(null);
    onClose(); // Close modal and reset selected category
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Edit Category</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Category Name
            </label>
            <input
              type="text"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-md focus:ring focus:ring-blue-300"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-md focus:ring focus:ring-blue-300"
              rows="4"
            ></textarea>
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Upload Image <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-4">
              <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-md flex items-center gap-2">
                <FaCloudUploadAlt /> Upload Image
                <input
                  type="file"
                  onChange={handleImageChange}
                  required={!preview} // only required if no image already
                  className="absolute opacity-0 w-0 h-0"
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

          <div className="flex justify-between">
            <button
              type="button"
              onClick={handleClose}
              className="bg-gray-500 text-white px-4 py-2 rounded-md font-medium cursor-pointer hover:bg-gray-600 transition duration-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-primary hover:scale-105 cursor-pointer transition duration-300 text-dark px-4 py-2 rounded-md font-medium"
            >
              {loading ? <SvgSpinner /> : "Update Category"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCategoryModal;
