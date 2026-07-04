import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { FaEye } from "react-icons/fa";
import useOrders from "../../Hooks/useOrders";
import ViewOrderModal from "../Orders/ViewOrderModal";

function InfluencerCouponsList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { refetch } = useOrders();
  const orders = useSelector((store) => store.orders) || [];

  // Refetch orders on load
  useEffect(() => {
    refetch();
  }, [refetch]);

  // Filter orders to only those that used an influencer coupon
  const influencerOrders = orders.filter((order) => {
    const hasInfluencerCoupon = order.promoCode && order.promoCode.influencerEmail;
    if (!hasInfluencerCoupon) return false;

    const codeMatch = order.promoCode.code?.toLowerCase().includes(searchTerm.toLowerCase());
    const emailMatch = order.promoCode.influencerEmail?.toLowerCase().includes(searchTerm.toLowerCase());
    const customerName = (order.user?.name || order.address?.fullName || "").toLowerCase();
    const customerMatch = customerName.includes(searchTerm.toLowerCase());

    return codeMatch || emailMatch || customerMatch;
  });

  // Pagination Logic
  const totalPages = Math.ceil(influencerOrders.length / perPage);
  const paginatedOrders = influencerOrders.slice(
    (page - 1) * perPage,
    page * perPage
  );

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto p-2 sm:p-4 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Influencer Coupon Usages</h2>

      {/* Search & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-2">
        <div className="w-full sm:w-80">
          <input
            type="text"
            className="border border-gray-400 p-2 rounded-lg w-full"
            placeholder="Search by code, influencer, or customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="text-sm text-gray-500 font-medium">
          Total Usages Found: {influencerOrders.length}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr className="text-left border-b border-gray-100">
              <th className="p-3 font-medium">Order ID</th>
              <th className="p-3 font-medium">Date</th>
              <th className="p-3 font-medium">Influencer Email</th>
              <th className="p-3 font-medium">Coupon Code</th>
              <th className="p-3 font-medium">Customer Details</th>
              <th className="p-3 font-medium">Items (Qty)</th>
              <th className="p-3 font-medium text-right">Discount</th>
              <th className="p-3 font-medium text-right">Total Price</th>
              <th className="p-3 font-medium text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedOrders.length > 0 ? (
              paginatedOrders.map((order) => {
                const customerName = order.user?.name || order.address?.fullName || "Guest Customer";
                const customerEmail = order.user?.email || order.guestEmail || "N/A";
                const discount = order.discount?.$numberDecimal ? parseFloat(order.discount.$numberDecimal) : parseFloat(order.discount) || 0;
                const totalPrice = order.totalPrice?.$numberDecimal ? parseFloat(order.totalPrice.$numberDecimal) : parseFloat(order.totalPrice) || 0;

                return (
                  <tr
                    key={order._id}
                    className="hover:bg-gray-50 text-gray-700 border-b border-gray-50 last:border-b-0 transition-colors"
                  >
                    <td className="p-3 font-medium text-gray-900">
                      {order.orderNumber || order._id.slice(-8).toUpperCase()}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <a href={`mailto:${order.promoCode.influencerEmail}`} className="text-primary hover:underline font-semibold">
                        {order.promoCode.influencerEmail}
                      </a>
                    </td>
                    <td className="p-3">
                      <span className="font-mono bg-purple-50 text-purple-700 px-2 py-0.5 rounded text-xs font-bold border border-purple-100">
                        {order.promoCode.code}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="font-medium">{customerName}</div>
                      <div className="text-xs text-gray-500">{customerEmail}</div>
                    </td>
                    <td className="p-3">
                      <div className="max-w-xs truncate text-xs">
                        {order.items?.map((item, idx) => (
                          <div key={item._id || idx}>
                            {item.product?.name || "Product"} ({item.quantity})
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="p-3 text-right font-medium text-red-600 whitespace-nowrap">
                      -${discount.toFixed(2)}
                    </td>
                    <td className="p-3 text-right font-bold text-gray-900 whitespace-nowrap">
                      ${totalPrice.toFixed(2)}
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleViewOrder(order)}
                        className="text-primary hover:text-primary/80 transition-transform hover:scale-110 p-1"
                        title="View Order Details"
                      >
                        <FaEye size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="9" className="text-center p-8 text-gray-500">
                  No influencer coupon usages recorded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-3">
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
            ))}
            <button
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              className="px-2 sm:px-3 py-1 mx-1 text-sm sm:text-base hover:bg-gray-200 disabled:opacity-50 rounded"
            >
              &gt;
            </button>
          </div>
        </div>
      )}

      {/* Order Viewer Modal */}
      {selectedOrder && (
        <ViewOrderModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedOrder(null);
          }}
          order={selectedOrder}
        />
      )}
    </div>
  );
}

export default InfluencerCouponsList;
