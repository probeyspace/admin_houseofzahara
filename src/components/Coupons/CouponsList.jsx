import { useState } from "react";
import { FaEdit, FaTrash, FaCalendarAlt, FaCheck, FaTimes } from "react-icons/fa";
import { useCoupons } from "../../Hooks/useCoupons";
import api from "../../Api/api";
import EditCouponModal from "./EditCouponModal.jsx";
import AddCouponModal from "./AddCouponModal.jsx";
import { toast } from "react-toastify";

function CouponsList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(5);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const { loading, coupons, setCoupons, fetchCoupons } = useCoupons();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Expiry Date Management States
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkExpiryDate, setBulkExpiryDate] = useState("");
  const [editingExpiryId, setEditingExpiryId] = useState(null);
  const [editExpiryDate, setEditExpiryDate] = useState("");

  const handleEdit = (coupon) => {
    setSelectedCoupon(coupon);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this coupon?")) {
      try {
        await api.delete(`/promoCode/${id}`);
        const updatedCoupons = coupons.filter((coupon) => coupon._id !== id);
        setCoupons(updatedCoupons);
        toast.success("Coupon deleted successfully");
      } catch (error) {
        toast.error(error?.response?.data?.message || "Delete failed");
        console.error("Error deleting coupon:", error);
      }
    }
  };

  // Selection Handlers
  const handleSelectAll = (e, paginatedCoupons) => {
    const pageIds = paginatedCoupons.map((c) => c._id);
    if (e.target.checked) {
      setSelectedIds((prev) => [...new Set([...prev, ...pageIds])]);
    } else {
      setSelectedIds((prev) => prev.filter((id) => !pageIds.includes(id)));
    }
  };

  const handleSelectOne = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleSelectAllAcrossPages = () => {
    const allIds = filteredCoupons?.map((c) => c._id) || [];
    setSelectedIds(allIds);
  };

  // Bulk Expiry Update
  const handleBulkUpdateExpiry = async () => {
    if (!bulkExpiryDate) {
      toast.warn("Please select a valid expiry date");
      return;
    }
    if (selectedIds.length === 0) {
      toast.warn("No coupons selected");
      return;
    }
    try {
      const response = await api.put("/promoCode/bulk-update/expiry", {
        ids: selectedIds,
        expiresAt: bulkExpiryDate,
      });
      toast.success(response.data.message || "Bulk update successful");
      setSelectedIds([]);
      setBulkExpiryDate("");
      fetchCoupons();
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Bulk update failed");
    }
  };

  // Inline Expiry Edit Handlers
  const handleStartEditExpiry = (coupon) => {
    setEditingExpiryId(coupon._id);
    setEditExpiryDate(coupon.expiresAt ? coupon.expiresAt.slice(0, 10) : "");
  };

  const handleSaveInlineExpiry = async (id) => {
    if (!editExpiryDate) {
      toast.warn("Please select a valid expiry date");
      return;
    }
    try {
      const response = await api.put(`/promoCode/${id}`, {
        expiresAt: editExpiryDate,
      });
      toast.success(response.data.message || "Expiry date updated successfully");
      setEditingExpiryId(null);
      fetchCoupons();
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Failed to update expiry date");
    }
  };

  // Filter coupons based on search
  const filteredCoupons = coupons?.filter((coupon) =>
    coupon?.code?.toLowerCase().includes(searchTerm?.toLowerCase())
  );

  // Pagination Logic
  const totalPages = Math.ceil(filteredCoupons?.length / perPage);
  const paginatedCoupons = filteredCoupons?.slice(
    (page - 1) * perPage,
    page * perPage
  );

  const isAllPageSelected = paginatedCoupons?.length > 0 && paginatedCoupons.every(c => selectedIds.includes(c._id));

  return (
    <div className="max-w-6xl mx-auto p-2 sm:p-4 bg-white shadow-md rounded-lg">
      {/* Search Input */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
        <div className="w-full sm:w-64">
          <input
            type="text"
            className="border border-gray-400 p-2 rounded-lg w-full"
            placeholder="Search coupons..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div>
          <button
            className="bg-primary text-dark px-4 py-2 rounded-lg hover:bg-primary/80 cursor-pointer"
            onClick={() => setShowModal(true)}
          >
            Add Coupon
          </button>
        </div>
      </div>

      {/* Coupons Table */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr className="text-left border-b border-gray-100">
                <th className="p-3 font-medium w-10 text-center">
                  <input
                    type="checkbox"
                    checked={isAllPageSelected}
                    onChange={(e) => handleSelectAll(e, paginatedCoupons || [])}
                    className="w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded cursor-pointer transition-colors"
                  />
                </th>
                <th className="p-3 font-medium">ID</th>
                <th className="p-3 font-medium">Code</th>
                <th className="p-3 font-medium">Discount Type</th>
                <th className="p-3 font-medium">Discount</th>
                <th className="p-3 font-medium">Expiry Date</th>
                <th className="p-3 font-medium">Visibility</th>
                <th className="p-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedCoupons?.map((coupon, index) => {
                const isSelected = selectedIds.includes(coupon._id);
                return (
                  <tr
                    key={coupon._id}
                    className={`text-gray-700 border-b border-gray-50 last:border-b-0 transition-all duration-200 ${
                      isSelected
                        ? "bg-primary/10 hover:bg-primary/20 font-medium"
                        : "hover:bg-gray-50/80"
                    }`}
                  >
                    <td className="p-2 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectOne(coupon._id)}
                        className="w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded cursor-pointer transition-colors"
                      />
                    </td>
                    <td className="p-2 text-sm sm:text-base">
                      {index + 1 + (page - 1) * perPage}
                    </td>
                    <td className="p-2 text-sm sm:text-base font-medium">
                      {coupon.code}
                    </td>
                    <td className="p-2 text-sm sm:text-base">
                      {coupon.discountType}
                    </td>
                    <td className="p-2 text-sm sm:text-base">
                      {coupon.discountValue}
                      {coupon.discountType === "Percentage" ? "%" : ""}
                    </td>
                    <td className="p-2 text-sm sm:text-base">
                      {editingExpiryId === coupon._id ? (
                        <div className="flex items-center gap-1.5 animate-fadeIn">
                          <input
                            type="date"
                            value={editExpiryDate}
                            onChange={(e) => setEditExpiryDate(e.target.value)}
                            className="border border-gray-400 p-1 rounded text-sm w-36 outline-none focus:ring-1 focus:ring-primary"
                          />
                          <button
                            onClick={() => handleSaveInlineExpiry(coupon._id)}
                            className="text-emerald-600 hover:text-emerald-800 p-1 cursor-pointer transition"
                            title="Save"
                          >
                            <FaCheck size={14} />
                          </button>
                          <button
                            onClick={() => setEditingExpiryId(null)}
                            className="text-red-600 hover:text-red-800 p-1 cursor-pointer transition"
                            title="Cancel"
                          >
                            <FaTimes size={14} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <button
                            onClick={() => handleStartEditExpiry(coupon)}
                            className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-50 border border-gray-200 text-gray-700 hover:bg-primary/20 hover:text-dark hover:border-primary/40 transition-all duration-200 cursor-pointer shadow-sm group"
                            title="Click to edit expiry date"
                          >
                            <FaCalendarAlt size={12} className="text-gray-400 group-hover:text-primary transition" />
                            <span>{new Date(coupon.expiresAt).toLocaleDateString()}</span>
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="p-2 text-sm sm:text-base">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          coupon.isHidden
                            ? "bg-amber-100 text-amber-700"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {coupon.isHidden ? "Hidden" : "Public"}
                      </span>
                    </td>
                    <td className="p-2 flex space-x-2 sm:space-x-3">
                      <button
                        onClick={() => handleEdit(coupon)}
                        className="text-gray-600 hover:text-gray-800 cursor-pointer transition hover:scale-110"
                        aria-label="Edit coupon"
                      >
                        <FaEdit size={16} className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(coupon._id)}
                        className="text-gray-600 hover:text-gray-800 cursor-pointer transition hover:scale-110"
                        aria-label="Delete coupon"
                      >
                        <FaTrash size={16} className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

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
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
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

      {/* Floating Glassmorphic Bulk Action Dock */}
      <div
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center justify-between gap-4 bg-white/85 backdrop-blur-md border border-gray-200/60 shadow-2xl px-6 py-4 rounded-full transition-all duration-355 transform ${
          selectedIds.length > 0
            ? "translate-y-0 opacity-100 scale-100"
            : "translate-y-10 opacity-0 scale-95 pointer-events-none"
        } w-[90%] sm:w-auto min-w-[320px] sm:min-w-[480px]`}
      >
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-dark shadow-sm animate-pulse">
            {selectedIds.length}
          </span>
          <span className="text-xs sm:text-sm font-semibold text-gray-700 whitespace-nowrap">
            Selected
          </span>
          {selectedIds.length > 0 && selectedIds.length < (filteredCoupons?.length || 0) && (
            <button
              onClick={handleSelectAllAcrossPages}
              className="text-[10px] sm:text-xs text-primary hover:opacity-80 underline font-bold cursor-pointer transition whitespace-nowrap ml-1"
            >
              Select all {filteredCoupons.length}
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 flex-grow justify-end">
          <input
            type="date"
            className="border border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary p-1.5 rounded-full text-xs bg-white text-gray-700 outline-none transition"
            value={bulkExpiryDate}
            onChange={(e) => setBulkExpiryDate(e.target.value)}
          />
          <button
            onClick={handleBulkUpdateExpiry}
            className="bg-primary hover:bg-primary/80 text-dark px-4 py-1.5 rounded-full text-xs font-bold transition duration-200 shadow-md hover:shadow-lg active:scale-95 cursor-pointer whitespace-nowrap"
          >
            Set Expiry
          </button>
          <button
            onClick={() => setSelectedIds([])}
            className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1.5 rounded-full text-xs font-bold transition duration-200 cursor-pointer whitespace-nowrap"
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Edit Coupon Modal */}
      <EditCouponModal
        show={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        coupon={selectedCoupon}
        onUpdate={fetchCoupons}
      />

      <AddCouponModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onUpdate={fetchCoupons}
      />
    </div>
  );
}

export default CouponsList;
