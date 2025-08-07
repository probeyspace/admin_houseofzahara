import { useState } from "react";
import { FaTrash, FaEye, FaEdit } from "react-icons/fa";
import { useBlogs } from "../../Hooks/useBlogs"; // your hook
import ViewBlogModal from "./ViewBlogModal"; // optional if you plan to implement viewing
import CreateBlogModal from "./CreateBlogModal ";
import { toast } from "react-toastify";
import EditBlogModal from "./EditBlogModal";
import CreateBlogCategoryModal from "./CreateBlogCategoryModal";

function BlogList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(5);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const {
    Blogs,
    deleteBlogs,
    loading,
    fetchBlogs,
    fetchCategories,
    createBlogCategory,
  } = useBlogs();

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this blog?")) {
      try {
        const res = await deleteBlogs(id);
        toast.success(res?.message || "Blog deleted successfully!");
      } catch (error) {
        console.error("Error deleting blog:", error);
      }
    }
  };

  const handleView = (blog) => {
    setSelectedBlog(blog);
    setIsViewModalOpen(true);
  };
  const handleEdit = (blog) => {
    setSelectedBlog(blog);
    setIsEditModalOpen(true);
  };

  const filteredBlogs = Blogs?.filter((blog) =>
    blog.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredBlogs?.length / perPage);
  const paginatedBlogs = filteredBlogs?.slice(
    (page - 1) * perPage,
    page * perPage
  );

  if (loading) return <div className="text-center py-3">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto p-4 bg-white shadow-md rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Blogs</h1>
        {/* //add blog button on the right side.. */}
        <div className="flex gap-3">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/80 cursor-pointer"
          >
            Add Blog
          </button>
          <button
            onClick={() => setIsAddCategoryModalOpen(true)}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/80 cursor-pointer"
          >
            Add Blog Category
          </button>
        </div>
      </div>

      <div className="mb-4 flex justify-between">
        <input
          type="text"
          className="border border-gray-400 p-2 rounded-lg w-full md:w-64"
          placeholder="Search by title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full rounded-lg shadow-md">
          <thead className="bg-gray-200 text-slate-600">
            <tr className="text-left">
              <th className="p-3">ID</th>
              <th className="p-3">Title</th>
              <th className="p-3 hidden md:table-cell">Author</th>
              <th className="p-3 hidden md:table-cell">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedBlogs?.map((blog, index) => (
              <tr key={blog.id} className="hover:bg-gray-100 text-gray-500">
                <td className="p-3">{index + 1 + (page - 1) * perPage}</td>
                <td className="p-3">{blog.title}</td>
                <td className="p-3 hidden md:table-cell">{blog.author}</td>
                <td className="p-3 hidden md:table-cell">
                  <span
                    className={`px-2 py-1 rounded-full text-sm ${
                      blog.isPublished
                        ? "bg-green-100 text-green-600"
                        : "bg-yellow-100 text-yellow-600"
                    }`}
                  >
                    {blog.isPublished ? "Published" : "Draft"}
                  </span>
                </td>
                <td className="p-3 flex space-x-3">
                  <button
                    onClick={() => handleView(blog)}
                    className="text-primary hover:text-primary/80 cursor-pointer"
                  >
                    <FaEye size={18} />
                  </button>
                  <button
                    onClick={() => handleEdit(blog)}
                    className="text-primary hover:text-primary/80 cursor-pointer"
                  >
                    <FaEdit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(blog.id)}
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
                  ? "bg-primary text-dark"
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

      {/* View Blog Modal */}
      <ViewBlogModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        blog={selectedBlog}
      />
      <CreateBlogModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        fetchBlogs={fetchBlogs}
      />
      <EditBlogModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        blog={selectedBlog}
        fetchBlogs={fetchBlogs}
      />
      <CreateBlogCategoryModal
        isOpen={isAddCategoryModalOpen}
        onClose={() => setIsAddCategoryModalOpen(false)}
        fetchCategories={fetchCategories}
        createBlogCategory={createBlogCategory}
      />
    </div>
  );
}

export default BlogList;
