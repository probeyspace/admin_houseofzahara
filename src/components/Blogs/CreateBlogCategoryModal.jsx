import { useState } from "react";
import { toast } from "react-toastify";

function CreateBlogCategoryModal({
  isOpen,
  onClose,
  fetchCategories,
  createBlogCategory,
}) {
  const [form, setForm] = useState({
    name: "",
    description: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name) {
      return toast.error("Name is required");
    }

    try {
      const res = await createBlogCategory(form);
      toast.success(res?.data?.message || "Category created successfully!");
      setForm({ name: "", description: "" });
      onClose();
      await fetchCategories();
    } catch (err) {
      console.error("Error creating category:", err);
      toast.error(err?.response?.data?.message || "Failed to create category");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/30 px-4">
      <div className="bg-white w-full max-w-md p-6 rounded-lg shadow-lg relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-gray-600 hover:text-red-600 text-xl"
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Create Blog Category
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Category Name"
            value={form.name}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />
          <textarea
            name="description"
            placeholder="Description (optional)"
            value={form.description}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />

          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/80"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateBlogCategoryModal;
