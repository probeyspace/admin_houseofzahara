import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { updateBlog } from "../../services/blog";
import SvgSpinner from "../../common/SvgSpinner";
import QuillEditor from "../common/QuillEditor";
import api from "../../Api/api";

const formatDateForInput = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const EditBlogModal = ({ isOpen, onClose, blog, onBlogUpdated }) => {
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    content: "",
    author: "",
    image: null,
    metaTitle: "",
    metaDetails: "",
    metaKeywords: "",
    imageAlt: "",
    categoryId: "",
    publishDate: "",
    status: "published",
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [categoriesList, setCategoriesList] = useState([]);

  useEffect(() => {
    if (isOpen) {
      api.get("/categories/blog")
        .then((res) => setCategoriesList(res.data.data || []))
        .catch((err) => console.error("Error fetching blog categories:", err));
    }
  }, [isOpen]);

  useEffect(() => {
    if (blog) {
      setFormData({
        title: blog.title || "",
        slug: blog.slug || "",
        content: blog.content || "",
        author: blog.author || "",
        image: null,
        metaTitle: blog.metaTitle || "",
        metaDetails: blog.metaDetails || "",
        metaKeywords: blog.metaKeywords || "",
        imageAlt: blog.imageAlt || "",
        categoryId: blog.categories && blog.categories.length > 0 ? (blog.categories[0]._id || blog.categories[0]) : "",
        publishDate: formatDateForInput(blog.publishDate || blog.createdAt),
        status: blog.status || "published",
      });
      setImagePreview(blog.imageUrl || null);
    }
  }, [blog]);

  const generateSlug = (text) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === "title") {
        updated.slug = generateSlug(value);
      }
      return updated;
    });
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

    if (formData.status === "published") {
      if (!formData.content || formData.content === "<p><br></p>") {
        toast.error("Please enter blog content to publish");
        return;
      }
      if (!formData.author) {
        toast.error("Please enter author name to publish");
        return;
      }
    }

    setLoading(true);

    const data = new FormData();
    data.append("title", formData.title);
    data.append("slug", formData.slug || generateSlug(formData.title));
    data.append("content", formData.content || "");
    data.append("author", formData.author || "");
    data.append("metaTitle", formData.metaTitle);
    data.append("metaDetails", formData.metaDetails);
    data.append("metaKeywords", formData.metaKeywords);
    data.append("imageAlt", formData.imageAlt);
    data.append("publishDate", formData.publishDate);
    data.append("status", formData.status);
    if (formData.categoryId !== undefined) {
      data.append("categories", formData.categoryId);
    }

    // Only append image if a new one was selected
    if (formData.image) {
      data.append("image", formData.image);
    }

    try {
      const response = await updateBlog(blog._id, data);
      toast.success(response?.message || "Blog updated successfully!");
      onBlogUpdated(); // Refresh the blog list
      onClose();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update blog");
    } finally {
      setLoading(false);
    }
  };

  const saveAsDraftDirectly = async () => {
    setLoading(true);
    const data = new FormData();
    data.append("title", formData.title);
    data.append("slug", formData.slug || generateSlug(formData.title));
    data.append("content", formData.content || "");
    data.append("author", formData.author || "");
    data.append("metaTitle", formData.metaTitle);
    data.append("metaDetails", formData.metaDetails);
    data.append("metaKeywords", formData.metaKeywords);
    data.append("imageAlt", formData.imageAlt);
    data.append("publishDate", formData.publishDate);
    data.append("status", "draft");
    if (formData.categoryId !== undefined) {
      data.append("categories", formData.categoryId);
    }
    if (formData.image) {
      data.append("image", formData.image);
    }

    try {
      const response = await updateBlog(blog._id, data);
      toast.success("Saved as draft successfully!");
      onBlogUpdated();
      onClose();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update blog");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelClick = () => {
    const isTitleChanged = formData.title !== (blog.title || "");
    const isContentChanged = formData.content !== (blog.content || "");
    const isAuthorChanged = formData.author !== (blog.author || "");
    const isStatusChanged = formData.status !== (blog.status || "published");
    const isImageChanged = !!formData.image;

    const hasChanges = isTitleChanged || isContentChanged || isAuthorChanged || isStatusChanged || isImageChanged;
    if (hasChanges) {
      if (window.confirm("You have unsaved changes. Would you like to save this blog as a draft before closing?")) {
        saveAsDraftDirectly();
      } else {
        onClose();
      }
    } else {
      onClose();
    }
  };

  const handleClose = () => {
    setFormData({ title: "", slug: "", content: "", author: "", image: null, metaTitle: "", metaDetails: "", metaKeywords: "", imageAlt: "", categoryId: "", publishDate: "", status: "published" });
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
              Slug *
            </label>
            <input
              type="text"
              name="slug"
              placeholder="Enter blog slug (e.g. timeless-beauty)"
              value={formData.slug}
              onChange={handleChange}
              className="w-full border border-gray-300 p-2 rounded"
              required
              maxLength={200}
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
              Category
            </label>
            <select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              className="w-full border border-gray-300 p-2 rounded text-sm sm:text-base text-gray-700"
            >
              <option value="">Select a Category</option>
              {categoriesList.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Publishing Date *
            </label>
            <input
              type="date"
              name="publishDate"
              value={formData.publishDate}
              onChange={handleChange}
              className="w-full border border-gray-300 p-2 rounded"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status *
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full border border-gray-300 p-2 rounded text-sm sm:text-base text-gray-700"
              required
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Meta Title
            </label>
            <input
              type="text"
              name="metaTitle"
              placeholder="Enter SEO meta title"
              value={formData.metaTitle}
              onChange={handleChange}
              className="w-full border border-gray-300 p-2 rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Meta Details
            </label>
            <textarea
              name="metaDetails"
              placeholder="Enter SEO meta details"
              value={formData.metaDetails}
              onChange={handleChange}
              className="w-full border border-gray-300 p-2 rounded"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Meta Keywords
            </label>
            <input
              type="text"
              name="metaKeywords"
              placeholder="Enter SEO meta keywords (comma-separated)"
              value={formData.metaKeywords}
              onChange={handleChange}
              className="w-full border border-gray-300 p-2 rounded"
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
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Image Alt Text *
            </label>
            <input
              type="text"
              name="imageAlt"
              placeholder="Alternative text describing the image"
              value={formData.imageAlt}
              onChange={handleChange}
              className="w-full border border-gray-300 p-2 rounded"
              required
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
              className="bg-primary text-dark px-4 py-2 rounded flex-1 cursor-pointer font-semibold"
              disabled={loading}
            >
              {loading ? <SvgSpinner /> : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={handleCancelClick}
              className="bg-gray-400 text-dark px-4 py-2 rounded flex-1 cursor-pointer font-semibold"
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
