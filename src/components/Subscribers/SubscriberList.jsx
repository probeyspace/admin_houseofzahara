// 📂 src/pages/SubscriberList.jsx
import { useState } from "react";
import { FaTrash } from "react-icons/fa";
import { useContact } from "../../Hooks/useContact";
import api from "../../Api/api";
import { toast } from "react-toastify";

function SubscriberList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const { subscribers, setSubscribers } = useContact();

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this subscriber?")) {
      try {
        await api.delete(`/contact/${id}`);
        const updated = subscribers.filter((s) => s._id !== id);
        setSubscribers(updated);
        toast.success("Subscriber deleted successfully!");
      } catch (error) {
        console.error("Error deleting subscriber:", error);
      }
    }
  };

  const filteredSubscribers = subscribers?.filter((s) =>
    s?.email?.toLowerCase().includes(searchTerm?.toLowerCase())
  );

  const totalPages = Math.ceil(filteredSubscribers?.length / perPage);
  const paginated = filteredSubscribers?.slice(
    (page - 1) * perPage,
    page * perPage
  );
  if (!subscribers) return <div className="text-center my-10">Loading...</div>;
  if (subscribers.length === 0)
    return <div className="text-center my-10">No subscribers found</div>;

  return (
    <div className="max-w-7xl mx-auto p-4 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-semibold mb-4">Subscribers</h2>

      <div className="flex justify-between mb-4">
        <input
          type="text"
          className="border border-gray-400 p-2 rounded-lg w-full max-w-xs"
          placeholder="Search subscribers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr className="text-left border-b border-gray-100">
              <th className="p-3 font-medium">#</th>
              <th className="p-3 font-medium">Email</th>
              <th className="p-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length > 0 ? (
              paginated.map((subscriber, index) => (
                <tr
                  key={subscriber._id}
                  className="hover:bg-gray-50 text-gray-700 border-b border-gray-50 last:border-b-0 transition-colors"
                >
                  <td className="p-3">
                    {index + 1 + (page - 1) * perPage}
                  </td>
                  <td className="p-3">{subscriber.email}</td>
                  <td className="p-3">
                    <button
                      onClick={() => handleDelete(subscriber._id)}
                      className="text-gray-600 hover:text-gray-800 cursor-pointer"
                    >
                      <FaTrash size={18} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="text-center py-4 text-gray-400">
                  No subscribers yet.
                </td>
              </tr>
            )}
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
            className="px-3 py-1 mx-1 hover:bg-gray-200 disabled:opacity-50"
          >
            &lt;
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`px-3 py-1 mx-1 rounded-full transition ${
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
              className="px-3 py-1 mx-1 text-gray-700 hover:bg-gray-200"
            >
              {totalPages}
            </button>
          )}
          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className="px-3 py-1 mx-1 hover:bg-gray-200 disabled:opacity-50"
          >
            &gt;
          </button>
        </div>
      </div>
    </div>
  );
}

export default SubscriberList;
