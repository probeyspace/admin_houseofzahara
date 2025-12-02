import { useState, useEffect } from "react";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import { toast } from "react-toastify";
import { getAllBlogs, deleteBlog } from "../../services/blog";
import SvgSpinner from "../../common/SvgSpinner";
import AddBlogModal from "./AddBlogModal";
import EditBlogModal from "./EditBlogModal";
import ViewBlogModal from "./ViewBlogModal";

function BlogList() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);

  useEffect(() => {
    loadBlogs();
  }, []);

  const loadBlogs = async () => {
    try {
      setLoading(true);
      const data = await getAllBlogs();
      setBlogs(data || []);
    } catch (error) {
      toast.error("Failed to load blogs");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this blog?")) {
      try {
        await deleteBlog(id);
        setBlogs(blogs.filter((blog) => blog._id !== id));
        toast.success("Blog deleted successfully!");
      } catch (error) {
        toast.error("Failed to delete blog");
      }
    }
  };

  const handleView = (blog) => {
    setSelectedBlog(blog);
    setShowViewModal(true);
  };

  const handleEdit = (blog) => {
    setSelectedBlog(blog);
    setShowEditModal(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Filter blogs based on search term
  const filteredBlogs = blogs?.filter((blog) => {
    const searchLower = searchTerm.toLowerCase();
    return blog.title?.toLowerCase().includes(searchLower);
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredBlogs?.length / perPage);
  const paginatedBlogs = filteredBlogs?.slice(
    (page - 1) * perPage,
    page * perPage
  );

  return (
    <div className="max-w-6xl mx-auto p-2 sm:p-4 bg-white shadow-md rounded-lg">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-3">
        <h1 className="text-2xl font-bold text-gray-800">Blog Management</h1>
        <div className="w-full sm:w-64">
          <input
            type="text"
            className="border border-gray-400 p-2 rounded-lg w-full text-sm sm:text-base"
            placeholder="Search blogs..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1); // Reset to first page when searching
            }}
          />
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-primary hover:bg-primary/80 text-dark py-2 px-4 rounded cursor-pointer"
        >
          Add Blog
        </button>
      </div>

      {/* Blog Table */}
      {loading ? (
        <div className="text-center py-8">
          <SvgSpinner />
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full rounded-lg shadow-md">
              <thead className="bg-gray-200 text-slate-600">
                <tr className="text-left">
                  <th className="p-2 sm:p-3 text-sm sm:text-base">#</th>
                  <th className="p-2 sm:p-3 text-sm sm:text-base">Title</th>
                  <th className="p-2 sm:p-3 text-sm sm:text-base hidden sm:table-cell">
                    Image
                  </th>
                  <th className="p-2 sm:p-3 text-sm sm:text-base hidden sm:table-cell">
                    Created Date
                  </th>
                  <th className="p-2 sm:p-3 text-sm sm:text-base">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedBlogs?.length > 0 ? (
                  paginatedBlogs.map((blog, index) => (
                    <tr
                      key={blog._id}
                      className="hover:bg-gray-100 text-gray-500"
                    >
                      <td className="p-2 sm:p-3">
                        {index + 1 + (page - 1) * perPage}
                      </td>
                      <td className="p-2 sm:p-3 font-medium">
                        {blog.title?.length > 50
                          ? blog.title.substring(0, 50) + "..."
                          : blog.title}
                      </td>
                      <td className="p-2 sm:p-3 hidden sm:table-cell">
                        {blog.image && (
                          <img
                            src={blog.image}
                            alt={blog.title}
                            className="w-16 h-16 object-cover rounded"
                          />
                        )}
                      </td>
                      <td className="p-2 sm:p-3 hidden sm:table-cell">
                        {formatDate(blog.createdAt)}
                      </td>
                      <td className="p-2 sm:p-3 flex space-x-2 sm:space-x-3">
                        <button
                          title="View Blog"
                          onClick={() => handleView(blog)}
                          className="text-gray-600 hover:text-gray-800 cursor-pointer"
                          aria-label="View blog"
                        >
                          <FaEye size={16} className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                        <button
                          title="Edit Blog"
                          onClick={() => handleEdit(blog)}
                          className="text-gray-600 hover:text-gray-800 cursor-pointer"
                          aria-label="Edit blog"
                        >
                          <FaEdit size={16} className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                        <button
                          title="Delete Blog"
                          onClick={() => handleDelete(blog._id)}
                          className="text-gray-600 hover:text-gray-800 cursor-pointer"
                          aria-label="Delete blog"
                        >
                          <FaTrash
                            size={16}
                            className="w-4 h-4 sm:w-5 sm:h-5"
                          />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="5"
                      className="p-2 sm:p-3 text-center text-gray-500"
                    >
                      No blogs found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-3">
            <div className="flex items-center">
              <label className="text-gray-600 font-medium mr-2 text-sm sm:text-base">
                Display:
              </label>
              <select
                value={perPage}
                onChange={(e) => setPerPage(Number(e.target.value))}
                className="border border-gray-400 text-gray-600 px-2 py-1 rounded-sm text-sm sm:text-base"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={30}>30</option>
              </select>
            </div>
            <div className="flex items-center overflow-x-auto w-full sm:w-auto justify-center sm:justify-start">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="px-2 sm:px-3 py-1 mx-1 text-sm sm:text-base hover:bg-gray-200 disabled:opacity-50 rounded"
                aria-label="Previous page"
              >
                &lt;
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`px-2 sm:px-3 py-1 mx-1 transition rounded-full text-sm sm:text-base min-w-[2rem] ${
                    page === i + 1
                      ? "bg-primary text-dark"
                      : "text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {i + 1}
                </button>
              )).slice(0, 5)}
              {totalPages > 5 && <span className="px-1 sm:px-2">...</span>}
              {totalPages > 5 && (
                <button
                  onClick={() => setPage(totalPages)}
                  className="px-2 sm:px-3 py-1 mx-1 border rounded-lg text-gray-700 hover:bg-gray-200 text-sm sm:text-base"
                >
                  {totalPages}
                </button>
              )}
              <button
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                className="px-2 sm:px-3 py-1 mx-1 text-sm sm:text-base hover:bg-gray-200 disabled:opacity-50 rounded"
                aria-label="Next page"
              >
                &gt;
              </button>
            </div>
          </div>
        </>
      )}

      {/* Modals */}
      <AddBlogModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onBlogAdded={loadBlogs}
      />
      <EditBlogModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        blog={selectedBlog}
        onBlogUpdated={loadBlogs}
      />
      <ViewBlogModal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        blog={selectedBlog}
      />
    </div>
  );
}

export default BlogList;
