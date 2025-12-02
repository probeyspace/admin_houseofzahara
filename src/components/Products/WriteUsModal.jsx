import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  fetchWriteUsByProduct,
  updateWriteUsStatus,
} from "../../services/writeUs";
import SvgSpinner from "../../common/SvgSpinner";

const WriteUsModal = ({ isOpen, onClose, product }) => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");

  // Fetch WriteUs inquiries when modal opens
  useEffect(() => {
    if (isOpen && product?._id) {
      loadInquiries();
    }
  }, [isOpen, product, statusFilter]);

  const loadInquiries = async () => {
    try {
      setLoading(true);
      const data = await fetchWriteUsByProduct(
        product._id,
        statusFilter || null
      );
      setInquiries(data || []);
    } catch (error) {
      toast.error("Failed to load inquiries");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleStatusChange = async (writeUsId, newStatus) => {
    try {
      await updateWriteUsStatus(writeUsId, newStatus);
      toast.success(`Status updated to ${newStatus}`);
      // Reload inquiries to reflect the change
      loadInquiries();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      PENDING: "bg-yellow-100 text-yellow-800",
      REPLIED: "bg-blue-100 text-blue-800",
      RESOLVED: "bg-green-100 text-green-800",
    };
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-semibold ${
          colors[status] || "bg-gray-100 text-gray-800"
        }`}
      >
        {status}
      </span>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-black/30 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-[700px] max-w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            User Inquiries - {product?.name}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Filter */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Status:
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => setStatusFilter("")}
              className={`px-3 cursor-pointer py-1 rounded ${
                statusFilter === ""
                  ? "bg-primary text-dark"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter("PENDING")}
              className={`px-3 cursor-pointer py-1 rounded ${
                statusFilter === "PENDING"
                  ? "bg-primary text-dark"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              Pending
            </button>
            {/* <button
              onClick={() => setStatusFilter("REPLIED")}
              className={`px-3 cursor-pointer py-1 rounded ${
                statusFilter === "REPLIED"
                  ? "bg-primary text-dark"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              Replied
            </button> */}
            <button
              onClick={() => setStatusFilter("RESOLVED")}
              className={`px-3 cursor-pointer py-1 rounded ${
                statusFilter === "RESOLVED"
                  ? "bg-primary text-dark"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              Resolved
            </button>
          </div>
        </div>

        {/* Inquiries List */}
        {loading ? (
          <div className="text-center py-8">
            <SvgSpinner />
          </div>
        ) : inquiries.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No inquiries found for this product.
          </p>
        ) : (
          <div className="space-y-4">
            {inquiries.map((inquiry) => (
              <div
                key={inquiry._id}
                className="border border-gray-300 p-4 rounded-lg bg-white hover:shadow-md transition"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold text-gray-800">
                      {inquiry.userId?.name || "Unknown User"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {inquiry.userId?.email || "No email"}
                    </p>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(inquiry.status)}
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(inquiry.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="mt-3">
                  <p className="font-medium text-gray-700 mb-1">
                    Subject: {inquiry.subject}
                  </p>
                  <p className="text-gray-600 text-sm bg-gray-50 p-2 rounded">
                    {inquiry.message}
                  </p>
                  {inquiry.adminReply && (
                    <div className="mt-3 bg-blue-50 p-2 rounded border-l-4 border-blue-400">
                      <p className="text-xs font-semibold text-blue-800 mb-1">
                        Admin Reply:
                      </p>
                      <p className="text-sm text-gray-700">
                        {inquiry.adminReply}
                      </p>
                    </div>
                  )}

                  {/* Status Change Button */}
                  {inquiry.status === "PENDING" && (
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() =>
                          handleStatusChange(inquiry._id, "RESOLVED")
                        }
                        className="px-4 cursor-pointer py-2 bg-green-500 text-white rounded hover:bg-green-600 transition text-sm font-medium"
                      >
                        Mark as Resolved
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Close Button */}
        <div className="mt-6">
          <button
            onClick={onClose}
            className="w-full bg-gray-400 text-dark px-4 py-2 rounded cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default WriteUsModal;
