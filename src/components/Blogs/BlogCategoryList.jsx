import { useState, useEffect } from "react";
import { FaTrash, FaPlus } from "react-icons/fa";
import { toast } from "react-toastify";
import api from "../../Api/api";
import SvgSpinner from "../../common/SvgSpinner";
import CreateBlogCategoryModal from "./CreateBlogCategoryModal";

function BlogCategoryList() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await api.get("/categories/blog");
      setCategories(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch blog categories:", err);
      toast.error("Failed to load blog categories");
    } finally {
      setLoading(false);
    }
  };

  const createBlogCategory = async (data) => {
    return await api.post("/categories/blog", data);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this blog category?")) {
      try {
        await api.delete(`/categories/blog/${id}`);
        toast.success("Blog category deleted successfully!");
        fetchCategories();
      } catch (err) {
        console.error("Error deleting blog category:", err);
        toast.error(err?.response?.data?.message || "Failed to delete blog category");
      }
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-4 bg-white shadow-md rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Blog Categories</h1>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-primary text-dark px-4 py-2 rounded-lg hover:bg-primary/80 cursor-pointer font-semibold flex items-center gap-2"
        >
          <FaPlus /> Add Blog Category
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <SvgSpinner />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr className="text-left border-b border-gray-100">
                <th className="p-3 font-medium">#</th>
                <th className="p-3 font-medium">Name</th>
                <th className="p-3 font-medium">Slug</th>
                <th className="p-3 font-medium">Description</th>
                <th className="p-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.length > 0 ? (
                categories.map((cat, index) => (
                  <tr
                    key={cat._id}
                    className="hover:bg-gray-50 text-gray-700 border-b border-gray-50 last:border-b-0 transition-colors"
                  >
                    <td className="p-3">{index + 1}</td>
                    <td className="p-3 font-medium">{cat.name}</td>
                    <td className="p-3">
                      <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                        {cat.slug}
                      </span>
                    </td>
                    <td className="p-3 text-gray-500">
                      {cat.description || "No description"}
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => handleDelete(cat._id)}
                        className="text-gray-600 hover:text-red-600 cursor-pointer"
                        title="Delete Category"
                      >
                        <FaTrash size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-3 text-center text-gray-500">
                    No blog categories found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <CreateBlogCategoryModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        fetchCategories={fetchCategories}
        createBlogCategory={createBlogCategory}
      />
    </div>
  );
}

export default BlogCategoryList;
