import { useState } from "react";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import ViewCategoryModal from "./ViewCategoryModal";
import { useCategory } from "../../Hooks/useCategory";
import api from "../../Api/api";
import EditCategoryModal from "./EditCategoryModal";
import { allCategory } from "../../store/slices/categorySlice";

function CategoryList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(5);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editModal, setEditModel] = useState(false);

  useCategory();
  const categories = useSelector((store) => store.category); // Get categories from Redux store
  const dispatch = useDispatch();
  const handleEdit = (category) => {
    setSelectedCategory(category);
    setEditModel(true);
  };

  const handleView = (category) => {
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await api.delete(`/categories/${id}`);
        const updatedCategories = categories.filter(
          (category) => category._id !== id
        );
        dispatch(allCategory(updatedCategories));
      } catch (error) {
        console.error("Error deleting category:", error);
      }
    }
  };

  // Filter categories based on search
  const filteredCategories = categories?.filter((category) =>
    category?.name?.toLowerCase().includes(searchTerm?.toLowerCase())
  );

  // Pagination Logic
  const totalPages = Math.ceil(filteredCategories?.length / perPage);
  const paginatedCategories = filteredCategories?.slice(
    (page - 1) * perPage,
    page * perPage
  );

  return (
    <div className="max-w-6xl mx-auto p-3 bg-white shadow-md rounded-lg">
      {/* Search Input */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <input
            type="text"
            className="border border-gray-400 p-2 rounded-lg w-64"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Categories Table */}
      <div className="overflow-x-auto">
        <table className="w-full rounded-lg shadow-md">
          <thead className="bg-gray-200 text-slate-600">
            <tr className="text-left">
              <th className="p-2">ID</th>
              <th className="p-2">Name</th>
              <th className="p-2">Description</th>
              <th className="p-2 ">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedCategories?.map((category, index) => (
              <tr
                key={category._id}
                className="hover:bg-gray-100 text-gray-500"
              >
                <td className="p-2">{index + 1 + (page - 1) * perPage}</td>
                <td className="p-2 ">{category.name}</td>
                <td className="p-2 ">{category.description}</td>
                <td className="p-2 flex space-x-3">
                  <button
                    onClick={() => handleView(category)}
                    className="text-primary hover:text-primary/80 cursor-pointer"
                  >
                    <FaEye size={18} />
                  </button>
                  <button
                    onClick={() => handleEdit(category)}
                    className="text-primary hover:text-primary/80 cursor-pointer"
                  >
                    <FaEdit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(category._id)}
                    className="text-primary hover:text-primary/80 cursor-pointer"
                  >
                    <FaTrash size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-4">
        <div>
          <label className="text-gray-600 font-medium mr-2">Display:</label>
          <select
            value={perPage}
            onChange={(e) => setPerPage(Number(e.target.value))}
            className="border border-gray-400 text-gray-600 px-2 py-1 rounded-sm"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
        </div>
        <div className="flex items-center">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="px-3 py-1 mx-1 text-lg hover:bg-gray-200 disabled:opacity-50"
          >
            &lt;
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`px-3 py-1 mx-1 transition rounded-full ${
                page === i + 1
                  ? "bg-primary text-white"
                  : "text-gray-700 hover:bg-gray-200"
              }`}
            >
              {i + 1}
            </button>
          )).slice(0, 5)}
          {totalPages > 5 && <span className="px-2">...</span>}
          {totalPages > 5 && (
            <button
              onClick={() => setPage(totalPages)}
              className="px-3 py-1 mx-1 border rounded-lg text-gray-700 hover:bg-gray-200"
            >
              {totalPages}
            </button>
          )}
          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className="px-3 py-1 mx-1 text-lg hover:bg-gray-200 disabled:opacity-50"
          >
            &gt;
          </button>
        </div>
      </div>

      {/* View Category Modal */}
      <ViewCategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        category={selectedCategory}
      />
      {/* Edit Category Modal */}
      <EditCategoryModal
        isOpen={editModal}
        onClose={() => {
          setEditModel(false);
          setSelectedCategory(null);
        }}
        category={selectedCategory}
      />
    </div>
  );
}

export default CategoryList;
