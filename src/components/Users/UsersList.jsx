import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import ViewUserModal from "./ViewUserModal";
import api from "../../Api/api";
import { setUsers } from "../../store/slices/usersSlice";
import { toast } from "react-toastify";
import useUsers from "../../Hooks/useUsers";
import { syncUserToZoho, syncAllUsersToZoho } from "../../services/zoho";
import { FaEye, FaTrash, FaSync } from "react-icons/fa";

function UsersList() {
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(5);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  useUsers(); // fetches and sets users in redux
  const users = useSelector((store) => store.users);

  const handleView = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        const res = await api.delete(`/users/${id}`);
        const updatedUsers = users.filter((user) => user._id !== id);
        dispatch(setUsers(updatedUsers));
        toast.success(res?.data?.message || "User deleted successfully!");
      } catch (error) {
        toast.error(error?.response?.data?.message || "Delete failed");
        console.error("Error deleting user:", error);
      }
    }
  };

  const handleSync = async (userId) => {
    try {
      const res = await syncUserToZoho(userId);
      toast.success(res?.message || "User synced to Zoho successfully!");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Sync failed");
      console.error("Error syncing user:", error);
    }
  };

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filteredUsers = users?.filter((user) => {
    if (!normalizedSearch) return true; // show everything when no query
    const name = user?.name?.toLowerCase() || "";
    const email = user?.email?.toLowerCase() || "";
    return (
      name.includes(normalizedSearch) || email.includes(normalizedSearch)
    );
  });

  const totalPages = Math.ceil((filteredUsers?.length || 0) / perPage);
  const paginatedUsers = filteredUsers?.slice(
    (page - 1) * perPage,
    page * perPage
  );

  return (
    <div className="max-w-6xl mx-auto p-4 bg-white shadow-md rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          className="border border-gray-400 p-2 rounded-lg w-64"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full rounded-lg shadow-md">
          <thead className="bg-gray-200 text-slate-600">
            <tr className="text-left">
              <th className="p-3">ID</th>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsers?.map((user, index) => (
              <tr key={user._id} className="hover:bg-gray-100 text-gray-500">
                <td className="p-3">{index + 1 + (page - 1) * perPage}</td>
                <td className="p-3">{user.name}</td>
                <td className="p-3">{user.email}</td>
                <td className="p-3 flex space-x-3">
                  <button
                    onClick={() => handleView(user)}
                    className="text-gray-600 hover:text-gray-800 cursor-pointer"
                  >
                    <FaEye size={20} />
                  </button>
                  <button
                    onClick={() => handleDelete(user._id)}
                    className="text-gray-600 hover:text-gray-800 cursor-pointer"
                  >
                    <FaTrash size={20} />
                  </button>
                  <button
                    onClick={() => handleSync(user._id)}
                    className="text-blue-600 hover:text-blue-800 cursor-pointer"
                    title="Sync to Zoho"
                  >
                    <FaSync size={18} />
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
              className="px-3 py-1 mx-1 text-gray-700 border rounded-lg hover:bg-gray-200"
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

      <ViewUserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        user={selectedUser}
      />
    </div>
  );
}

export default UsersList;
