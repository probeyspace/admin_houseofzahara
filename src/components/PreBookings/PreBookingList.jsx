import { useEffect, useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import api from "../../Api/api";
import { toast } from "react-toastify";
import { FiDownload, FiSearch } from "react-icons/fi";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

function PreBookingList() {
  const [preBookings, setPreBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loadingId, setLoadingId] = useState(null);

  const fetchPreBookings = async () => {
    try {
      const response = await api.get("/pre-bookings");
      setPreBookings(response.data.data);
    } catch (error) {
      console.error("Error fetching pre-bookings:", error);
      toast.error("Failed to load pre-bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPreBookings();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    if (loadingId === id) return;
    setLoadingId(id);
    try {
      await api.patch(`/pre-bookings/${id}`, { status });
      toast.success("Status updated successfully");
      fetchPreBookings();
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    try {
      await api.delete(`/pre-bookings/${id}`);
      toast.success("Record deleted successfully");
      fetchPreBookings();
    } catch (error) {
      console.error("Error deleting record:", error);
      toast.error("Failed to delete record");
    }
  };

  const filteredData = preBookings.filter((item) => {
    const search = searchTerm.toLowerCase();
    const matchesSearch =
      item.email.toLowerCase().includes(search) ||
      item.phone.includes(searchTerm) ||
      item.product?.name?.toLowerCase().includes(search);

    const matchesStatus = statusFilter ? item.status === statusFilter : true;

    return matchesSearch && matchesStatus;
  });

  const exportToExcel = () => {
    if (!filteredData.length) {
      toast.warning("No data to export.");
      return;
    }

    const data = filteredData.map((item, index) => ({
      "S.No": index + 1,
      Product: item.product?.name || "N/A",
      Email: item.email,
      Phone: item.phone,
      Type: item.type,
      Status: item.status,
      Date: new Date(item.createdAt).toLocaleString(),
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "PreBookings");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, "pre_bookings.xlsx");
  };

  return (
    <div className="max-w-7xl mx-auto p-4 bg-white shadow-md rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">
          Pre-bookings & Notifications
        </h2>
        <button
          onClick={exportToExcel}
          className="bg-primary hover:bg-primary/90 text-dark py-2 px-4 rounded-lg flex items-center gap-2 transition-all shadow-sm"
        >
          <FiDownload className="text-lg" />
          <span>Export Excel</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search by email, phone or product..."
            className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 focus:ring-2 focus:ring-primary/50 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>

        <select
          className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/50 outline-none"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="NOTIFIED">Notified</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr className="text-left">
              <th className="p-3 font-medium">#</th>
              <th className="p-3 font-medium">Product</th>
              <th className="p-3 font-medium">User Details</th>
              <th className="p-3 font-medium">Status</th>
              <th className="p-3 font-medium">Date</th>
              <th className="p-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="text-center p-4">
                  Loading...
                </td>
              </tr>
            ) : filteredData.length > 0 ? (
              filteredData.map((item, index) => (
                <tr
                  key={item._id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="p-3 text-gray-500">{index + 1}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-gray-800">
                        {item.product?.name || "N/A"}
                      </span>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-800">
                        {item.email}
                      </span>
                      <span className="text-xs text-gray-500">
                        {item.phone}
                      </span>
                    </div>
                  </td>
                  {/* <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${item.type === 'PRE_ORDER' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                        {item.type}
                    </span>
                  </td> */}
                  <td className="p-3">
                    <select
                      value={loadingId === item._id ? "SENDING" : item.status}
                      onChange={(e) =>
                        handleUpdateStatus(item._id, e.target.value)
                      }
                      disabled={
                        item.status !== "PENDING" || loadingId === item._id
                      }
                      className={`text-xs p-1 rounded border-none font-semibold cursor-pointer disabled:cursor-not-allowed ${
                        loadingId === item._id
                          ? "bg-blue-100 text-blue-700"
                          : item.status === "PENDING"
                          ? "bg-yellow-100 text-yellow-700"
                          : item.status === "NOTIFIED"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {loadingId === item._id && (
                        <option value="SENDING">Sending...</option>
                      )}
                      <option value="PENDING">Pending</option>
                      <option value="NOTIFIED">Notified</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </td>
                  <td className="p-3 text-gray-500">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <FaTrash size={16} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center p-4 text-gray-400">
                  No records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default PreBookingList;
