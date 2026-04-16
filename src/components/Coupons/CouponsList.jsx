import { useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import { useCoupons } from "../../Hooks/useCoupons";
import api from "../../Api/api";
import EditCouponModal from "./EditCouponModal.jsx";
import AddCouponModal from "./AddCouponModal.jsx";

function CouponsList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(5);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const { loading, coupons, setCoupons, fetchCoupons } = useCoupons();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);

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
      } catch (error) {
        toast.error(error?.response?.data?.message || "Delete failed");
        console.error("Error deleting coupon:", error);
      }
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
                <th className="p-3 font-medium">ID</th>
                <th className="p-3 font-medium">Code</th>
                <th className="p-3 font-medium">Discount Type</th>
                <th className="p-3 font-medium">Discount</th>
                <th className="p-3 font-medium hidden sm:table-cell">Expiry Date</th>
                <th className="p-3 font-medium">Visibility</th>
                <th className="p-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedCoupons?.map((coupon, index) => (
                <tr
                  key={coupon._id}
                  className="hover:bg-gray-50 text-gray-700 border-b border-gray-50 last:border-b-0 transition-colors"
                >
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
                  <td className="p-2 text-sm sm:text-base hidden sm:table-cell">
                    {new Date(coupon.expiresAt).toLocaleDateString()}
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
                      className="text-gray-600 hover:text-gray-800 cursor-pointer"
                      aria-label="Edit coupon"
                    >
                      <FaEdit size={16} className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(coupon._id)}
                      className="text-gray-600 hover:text-gray-800 cursor-pointer"
                      aria-label="Delete coupon"
                    >
                      <FaTrash size={16} className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </td>
                </tr>
              ))}
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
