import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { updateBlog } from "../../services/blog";
import SvgSpinner from "../../common/SvgSpinner";
import QuillEditor from "../common/QuillEditor";

const EditBlogModal = ({ isOpen, onClose, blog, onBlogUpdated }) => {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    author: "",
    image: null,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (blog) {
      setFormData({
        title: blog.title || "",
        content: blog.content || "",
        author: blog.author || "",
        image: null,
      });
      setImagePreview(blog.imageUrl || null);
    }
  }, [blog]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleContentChange = (content) => {
    setFormData((prev) => ({ ...prev, content }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB");
        return;
      }
      setFormData((prev) => ({ ...prev, image: file }));
      // Create preview for new image
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.content || formData.content === "<p><br></p>") {
      toast.error("Please enter blog content");
      return;
    }

    setLoading(true);

    const data = new FormData();
    data.append("title", formData.title);
    data.append("content", formData.content);
    data.append("author", formData.author);

    // Only append image if a new one was selected
    if (formData.image) {
      data.append("image", formData.image);
    }

    try {
      const response = await updateBlog(blog._id, data);
      toast.success(response?.message || "Blog updated successfully!");
      onBlogUpdated(); // Refresh the blog list
      handleClose();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update blog");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ title: "", content: "", author: "", image: null });
    setImagePreview(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-black/30 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-[800px] max-w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Edit Blog</h2>
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
              Author *
            </label>
            <input
              type="text"
              name="author"
              placeholder="Enter author name"
              value={formData.author}
              onChange={handleChange}
              className="w-full border border-gray-300 p-2 rounded"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Content *
            </label>
            <QuillEditor
              value={formData.content}
              onChange={handleContentChange}
              placeholder="Write your blog content here..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Blog Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="border border-gray-300 px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-400 w-full"
            />
            {imagePreview && (
              <div className="mt-2">
                <p className="text-xs text-gray-500 mb-1">
                  {formData.image ? "New Image Preview" : "Current Image"}
                </p>
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
              {loading ? <SvgSpinner /> : "Update Blog"}
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

export default EditBlogModal;
