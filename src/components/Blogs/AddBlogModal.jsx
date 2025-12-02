import { useState } from "react";
import { toast } from "react-toastify";
import { createBlog } from "../../services/blog";
import SvgSpinner from "../../common/SvgSpinner";

const AddBlogModal = ({ isOpen, onClose, onBlogAdded }) => {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    image: null,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB");
        return;
      }
      setFormData((prev) => ({ ...prev, image: file }));
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.image) {
      toast.error("Please select an image");
      return;
    }

    setLoading(true);
    const data = new FormData();
    data.append("title", formData.title);
    data.append("content", formData.content);
    data.append("image", formData.image);

    try {
      const response = await createBlog(data);
      toast.success(response?.message || "Blog created successfully!");
      onBlogAdded(); // Refresh the blog list
      handleClose();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to create blog");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ title: "", content: "", image: null });
    setImagePreview(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-black/30 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-[600px] max-w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Add New Blog</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              name="title"
              placeholder="Enter blog title"
              value={formData.title}
              onChange={handleChange}
              className="w-full border border-gray-300 p-2 rounded"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Content *
            </label>
            <textarea
              name="content"
              placeholder="Enter blog content"
              value={formData.content}
              onChange={handleChange}
              className="w-full border border-gray-300 p-2 rounded"
              rows={8}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Blog Image *
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="border border-gray-300 px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-400 w-full"
              required
            />
            {imagePreview && (
              <div className="mt-2">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded"
                />
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-primary text-dark px-4 py-2 rounded flex-1 cursor-pointer"
              disabled={loading}
            >
              {loading ? <SvgSpinner /> : "Create Blog"}
            </button>
            <button
              type="button"
              onClick={handleClose}
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

export default AddBlogModal;
