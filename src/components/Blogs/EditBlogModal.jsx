import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useBlogs } from "../../Hooks/useBlogs";

function EditBlogModal({ isOpen, onClose, blog, fetchBlogs }) {
  const { updateBlogs, loading, categories } = useBlogs();

  const [form, setForm] = useState({
    title: "",
    author: "",
    description: "",
    content: "",
    blogCategoryId: "",
    isPublished: false,
  });

  const [coverImage, setCoverImage] = useState(null);
  const [images, setImages] = useState([]);

  useEffect(() => {
    if (!isOpen || !blog) return;
    setForm({
      title: blog.title || "",
      author: blog.author || "",
      description: blog.description || "",
      content: blog.content || "",
      blogCategoryId: blog.blogCategoryId || "",
      isPublished: blog.isPublished || false,
    });
  }, [isOpen, blog]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title || !form.author || !form.description || !form.content) {
      return toast.error("All required fields must be filled.");
    }

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      formData.append(key, value);
    });

    if (coverImage) formData.append("coverImage", coverImage);
    images.forEach((img) => formData.append("images", img));

    try {
      const res = await updateBlogs(blog._id, formData);
      await fetchBlogs();
      toast.success(res?.message || "Blog updated successfully!");
      onClose();
    } catch (err) {
      console.error("Update failed:", err);
      toast.error(err?.response?.data?.message || "Blog update failed");
    }
  };

  if (!isOpen || !blog) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/30 px-4">
      <div className="bg-white w-full max-w-3xl p-6 rounded-lg shadow-lg overflow-y-auto max-h-[90vh] relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-600 hover:text-red-600 text-xl"
        >
          &times;
        </button>

        <h2 className="text-2xl font-bold mb-4 text-gray-800">Edit Blog</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="title"
            placeholder="Title"
            value={form.title}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />

          <input
            type="text"
            name="author"
            placeholder="Author"
            value={form.author}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />

          <textarea
            name="description"
            placeholder="Short Description"
            value={form.description}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />

          <textarea
            name="content"
            placeholder="Full Content"
            value={form.content}
            onChange={handleChange}
            className="w-full border p-2 rounded h-32"
            required
          />

          <select
            name="blogCategoryId"
            value={form.blogCategoryId}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>

          {/* Cover Image */}
          <div>
            <label className="font-medium">Cover Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setCoverImage(e.target.files[0])}
              className="w-full border p-2 rounded"
            />
            {blog.coverImage && !coverImage && (
              <img
                src={blog.coverImage}
                alt="Current cover"
                className="mt-2 w-40 rounded"
              />
            )}
          </div>

          {/* Additional Images */}
          <div>
            <label className="font-medium">Additional Images</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setImages(Array.from(e.target.files))}
              className="w-full border p-2 rounded"
            />
            {blog.images?.length > 0 && !images.length && (
              <div className="flex gap-2 mt-2">
                {blog.images.map((img) => (
                  <img
                    key={img._id}
                    src={img.url}
                    alt={img.altText || "Blog image"}
                    className="w-16 h-16 object-cover rounded"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Status */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="isPublished"
              checked={form.isPublished}
              onChange={handleChange}
            />
            <label className="text-gray-700">Publish</label>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-primary text-white px-5 py-2 rounded hover:bg-primary/80"
            >
              {loading ? "Updating..." : "Update Blog"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditBlogModal;
