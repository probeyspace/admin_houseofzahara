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
  const { coupons, setCoupons, fetchCoupons } = useCoupons();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const handleEdit = (coupon) => {
    setSelectedCoupon(coupon);
    setIsModalOpen(true);
  };

  const handleDelete = async (code) => {
    if (window.confirm("Are you sure you want to delete this coupon?")) {
      try {
        await api.delete(`/promoCode/${code}`);
        const updatedCoupons = coupons.filter((coupon) => coupon.code !== code);
        setCoupons(updatedCoupons);
      } catch (error) {
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
      <div className="overflow-x-auto">
        <table className="w-full rounded-lg shadow-md">
          <thead className="bg-gray-200 text-slate-600">
            <tr className="text-left">
              <th className="p-2 text-sm sm:text-base">ID</th>
              <th className="p-2 text-sm sm:text-base">Code</th>
              <th className="p-2 text-sm sm:text-base">Discount</th>
              <th className="p-2 text-sm sm:text-base hidden sm:table-cell">
                Expiry Date
              </th>
              <th className="p-2 text-sm sm:text-base">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedCoupons?.map((coupon, index) => (
              <tr key={coupon.id} className="hover:bg-gray-100 text-gray-500">
                <td className="p-2 text-sm sm:text-base">
                  {index + 1 + (page - 1) * perPage}
                </td>
                <td className="p-2 text-sm sm:text-base font-medium">
                  {coupon.code}
                </td>
                <td className="p-2 text-sm sm:text-base">₹{coupon.discount}</td>
                <td className="p-2 text-sm sm:text-base hidden sm:table-cell">
                  {new Date(coupon.expiry).toLocaleDateString()}
                </td>
                <td className="p-2 flex space-x-2 sm:space-x-3">
                  <button
                    onClick={() => handleEdit(coupon)}
                    className="text-primary hover:text-primary/80 cursor-pointer"
                    aria-label="Edit coupon"
                  >
                    <FaEdit size={16} className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(coupon.code)}
                    className="text-primary hover:text-primary/80 cursor-pointer"
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
                  ? "bg-primary text-white"
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
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        couponData={selectedCoupon}
        onUpdate={fetchCoupons}
      />

      <AddCouponModal show={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
}

export default CouponsList;
