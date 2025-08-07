import { useState, useEffect } from "react";
import { FaEye, FaTrash, FaPlus } from "react-icons/fa";
import api from "../../Api/api";
import ViewArticleModal from "./ViewArticleModal";

const Articles = () => {
  const [articles, setArticles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(5);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [newArticle, setNewArticle] = useState({
    title: "",
    author: "",
    description: "",
    image: null,
  });

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const res = await api.get("/articles");
      console.log(res.data.data);
      setArticles(res.data.data);
    } catch (err) {
      console.error("Error fetching articles:", err);
    }
  };

  const handleView = (article) => {
    setSelectedArticle(article);
    setIsViewModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this article?")) {
      try {
        await api.delete(`/articles/${id}`);
        setArticles(articles.filter((a) => a._id !== id));
      } catch (err) {
        console.error("Error deleting article:", err);
      }
    }
  };

  const handleCreateArticle = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", newArticle.title);
    formData.append("author", newArticle.author);
    formData.append("description", newArticle.description);
    formData.append("image", newArticle.image);

    try {
      await api.post("/articles", formData);
      fetchArticles();
      setIsAddModalOpen(false);
      setNewArticle({ title: "", author: "", description: "", image: null });
    } catch (err) {
      console.error("Error creating article:", err);
    }
  };

  const filteredArticles = articles.filter((article) =>
    article.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredArticles.length / perPage);
  const paginatedArticles = filteredArticles.slice(
    (page - 1) * perPage,
    page * perPage
  );

  return (
    <div className="max-w-6xl mx-auto p-4 bg-white shadow-md rounded-lg">
      {/* Top Bar */}
      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          className="border border-gray-400 p-2 rounded-lg w-full md:w-64"
          placeholder="Search by Title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg shadow hover:bg-primary/80 transition"
        >
          <FaPlus /> Add Article
        </button>
      </div>

      {/* Articles Table */}
      <div className="overflow-x-auto">
        <table className="w-full rounded-lg shadow-md">
          <thead className="bg-gray-200 text-slate-600">
            <tr className="text-left">
              <th className="p-3">ID</th>
              <th className="p-3">Title</th>
              <th className="p-3">Author</th>
              <th className="p-3">Date</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedArticles.map((article, index) => (
              <tr key={article._id} className="hover:bg-gray-100 text-gray-500">
                <td className="p-3">{index + 1 + (page - 1) * perPage}</td>
                <td className="p-3">{article.title}</td>
                <td className="p-3">{article.author}</td>
                <td className="p-3">
                  {new Date(article.date).toLocaleDateString()}
                </td>
                <td className="p-3 flex space-x-3">
                  <button
                    onClick={() => handleView(article)}
                    className="text-blue-600 hover:text-blue-800 cursor-pointer"
                  >
                    <FaEye size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(article._id)}
                    className="text-red-600 hover:text-red-800 cursor-pointer"
                  >
                    <FaTrash size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
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

      {/* View Modal */}
      <ViewArticleModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        article={selectedArticle}
      />

      {/* Add Article Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-lg w-full relative">
            <h2 className="text-xl font-semibold mb-4">Add Article</h2>
            <form onSubmit={handleCreateArticle} className="space-y-4">
              <input
                type="text"
                placeholder="Title"
                className="w-full border p-2 rounded"
                value={newArticle.title}
                onChange={(e) =>
                  setNewArticle({ ...newArticle, title: e.target.value })
                }
                required
              />
              <input
                type="text"
                placeholder="Author"
                className="w-full border p-2 rounded"
                value={newArticle.author}
                onChange={(e) =>
                  setNewArticle({ ...newArticle, author: e.target.value })
                }
                required
              />
              <textarea
                placeholder="Description"
                className="w-full border p-2 rounded"
                rows={4}
                value={newArticle.description}
                onChange={(e) =>
                  setNewArticle({ ...newArticle, description: e.target.value })
                }
                required
              />
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setNewArticle({ ...newArticle, image: e.target.files[0] })
                }
                className="w-full"
                required
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/80"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Articles;
