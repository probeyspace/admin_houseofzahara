import { useState } from "react";
import { FaEye, FaEdit, FaSync } from "react-icons/fa";
import { useSelector } from "react-redux";
import ViewOrderModal from "./ViewOrderModal";
import EditOrderModal from "./EditOrderModal";
import api from "../../Api/api";
import { toast } from "react-toastify";
import { FiDownload, FiSearch } from "react-icons/fi";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { syncOrderToZoho } from "../../services/zoho";

function OrderList() {
  //GET STATUS FROM THE QUERY PARAMS
  const status = new URLSearchParams(window.location.search).get("status");
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [statusFilter, setStatusFilter] = useState(status || "");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("");

  const orders = useSelector((store) => store.orders);

  const handleChangeStatus = async (id, status) => {
    try {
      await api.put(`/orders/${id}`, { status });
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("Failed to update order status. Please try again.");
    }
  };

  const handleEdit = (order) => {
    setSelectedOrder(order);
    setIsEditModalOpen(true);
  };

  const handleView = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleSyncOrder = async (orderId) => {
    try {
      const res = await syncOrderToZoho(orderId);
      toast.success(res?.message || "Order sync triggered successfully!");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Sync failed");
      console.error("Error syncing order:", error);
    }
  };

  // Filter orders
  const filteredOrders = orders?.filter((order) => {
    const search = searchTerm?.toLowerCase();

    const matchesOrderId = order?._id?.toLowerCase().includes(search);
    const matchesCustomerName = order?.user?.name
      ?.toLowerCase()
      .includes(search);

    const matchesSearch = matchesOrderId || matchesCustomerName;

    // Handle RETURN_REQUESTED filter specially
    const matchesStatus = statusFilter === "RETURN_REQUESTED"
      ? order.isReturnRequested && order.status === "DELIVERED"
      : statusFilter ? order.status === statusFilter : true;

    const matchesPaymentMethod = paymentMethodFilter
      ? order.payment?.paymentMethod === paymentMethodFilter
      : true;

    const matchesDateRange =
      (!startDate || new Date(order.createdAt) >= new Date(startDate)) &&
      (!endDate ||
        new Date(order.createdAt) <=
          new Date(new Date(endDate).setHours(23, 59, 59, 999)));

    return (
      matchesSearch && matchesStatus && matchesDateRange && matchesPaymentMethod
    );
  });

  const uniqueStatuses = [...new Set(orders?.map((order) => order.status))];
  const exportToExcel = () => {
    if (!filteredOrders.length) {
      toast.warning("No orders to export.");
      return;
    }

    const data = filteredOrders.flatMap((order, index) =>
      order.items.map((item, idx) => ({
        "S.No": index + 1,
        "Order ID": order._id,
        "Customer Name": order.user?.name || "N/A",
        "Customer Email": order.user?.email || "N/A",
        "Order Status": order.status,
        "Payment Method": order.payment?.paymentMethod || "N/A",
        "Payment Status": order.payment?.paymentStatus || "N/A",
        "Total Price": order.totalPrice?.$numberDecimal || order.totalPrice,
        "Shipment Fee": order.shipment,
        Discount: order.discount?.$numberDecimal || order.discount || 0,

        // Product + Variant Details
        "Product Name": item.product?.name || "N/A",
        SKU: item.variant?.sku || "N/A",
        Qty: item.quantity,
        "Item Price": item.price?.$numberDecimal || item.price || "N/A",
        "Variant Size": item.variant?.specs?.size || "N/A",
        "Skin Type": item.variant?.specs?.skinType || "N/A",
        Packaging: item.variant?.specs?.packaging || "N/A",
        "Expiry Date": item.variant?.specs?.expiryDate
          ? new Date(item.variant.specs.expiryDate).toLocaleDateString()
          : "N/A",

        "Created At": new Date(order.createdAt).toLocaleString(),
      }))
    );

    const worksheet = XLSX.utils.json_to_sheet(data);

    worksheet["!cols"] = [
      { wch: 6 }, // S.No
      { wch: 40 }, // Order ID
      { wch: 20 }, // Customer Name
      { wch: 30 }, // Email
      { wch: 15 }, // Status
      { wch: 20 }, // Payment Method
      { wch: 20 }, // Payment Status
      { wch: 15 }, // Total Price
      { wch: 10 }, // Discount
      { wch: 40 }, // Product Name
      { wch: 15 }, // SKU
      { wch: 5 }, // Qty
      { wch: 15 }, // Item Price
      { wch: 15 }, // Variant Size
      { wch: 20 }, // Skin Type
      { wch: 20 }, // Packaging
      { wch: 15 }, // Expiry Date
      { wch: 25 }, // Created At
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(blob, "orders.xlsx");
  };

  return (
    <div className="max-w-7xl mx-auto p-4 bg-white shadow-md rounded-lg">
      {/* Filtering, Export, and Sorting - Modern Redesign */}
      <div className="space-y-2 mb-6">
        {/* Second Row: Search + Status Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 min-w-[200px]">
            <label
              htmlFor="search"
              className="block text-xs font-medium text-gray-700 mb-1"
            >
              Search Orders
            </label>
            <div className="relative">
              <input
                id="search"
                type="text"
                placeholder="Search by Order ID, Customer Name..."
                className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label
              htmlFor="status-filter"
              className="block text-xs font-medium text-gray-700 mb-1"
            >
              By Order Status
            </label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all appearance-none bg-white bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZXZyb24tZG93bic+PHBhdGggZD0ibTYgOSA2IDYgNi02Ii8+PC9zdmc+')] bg-no-repeat bg-[center_right_0.5rem]"
            >
              <option value="">All Statuses</option>
              <option value="RETURN_REQUESTED">🔔 Return Requested</option>
              {uniqueStatuses.map((status) => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() +
                    status.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label
              htmlFor="status-filter"
              className="block text-xs font-medium text-gray-700 mb-1"
            >
              By Payment Method
            </label>
            <select
              id="status-filter"
              value={paymentMethodFilter}
              onChange={(e) => setPaymentMethodFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all appearance-none bg-white bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZXZyb24tZG93biI+PHBhdGggZD0ibTYgOSA2IDYgNi02Ii8+PC9zdmc+')] bg-no-repeat bg-[center_right_0.5rem]"
            >
              <option value="">All Methods</option>
              <option key="COD" value="CASH_ON_DELIVERY">
                Cash on Delivery
              </option>
              <option key="Online" value="ONLINE">
                Online
              </option>
            </select>
          </div>
        </div>
        {/* First Row: Date Range + Export */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between md:items-end">
          {/* Date Range with labels */}
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="flex-1 min-w-[200px]">
              <label
                htmlFor="start-date"
                className="block text-xs font-medium text-gray-700 mb-1"
              >
                Start Date
              </label>
              <input
                id="start-date"
                type="date"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="flex-1 min-w-[200px]">
              <label
                htmlFor="end-date"
                className="block text-xs font-medium text-gray-700 mb-1"
              >
                End Date
              </label>
              <input
                id="end-date"
                type="date"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          {/* Export button - moves to right on larger screens */}
          <button
            title="Export Order List to Excel"
            className="bg-primary hover:bg-primary/90 text-dark py-2 px-4 rounded-lg cursor-pointer flex items-center gap-2 transition-colors shadow-sm hover:shadow-md w-full md:w-auto justify-center"
            onClick={exportToExcel}
          >
            <FiDownload className="text-lg" />
            <span>Export to Excel</span>
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="overflow-x-auto">
        <table className="table-auto min-w-max w-full text-sm rounded-lg shadow-md">
          <thead className="bg-gray-100 text-gray-600">
            <tr className="text-left">
              <th className="p-3">#</th>
              <th className="p-3">Order ID</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Date</th>
              <th className="p-3">Status</th>
              <th className="p-3">Total</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders?.map((order, index) => (
              <tr key={order._id} className="hover:bg-gray-50 text-gray-700">
                <td className="p-3">{index + 1}</td>
                <td className="p-3 font-medium truncate max-w-[120px]">
                  {order._id}
                </td>
                <td className="p-3">{order?.user?.name || "Unknown"}</td>
                <td className="p-3">
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      order.status === "PROCESSING"
                        ? "bg-blue-100 text-blue-600"
                        : order.status === "CANCELLED"
                        ? "bg-red-100 text-red-600"
                        : order.status === "PENDING"
                        ? "bg-yellow-100 text-yellow-600"
                        : order.status === "SHIPPED"
                        ? "bg-purple-100 text-purple-600"
                        : order.status === "DELIVERED"
                        ? "bg-green-100 text-green-600"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {order.status}
                  </span>
                  {/* Return Requested Badge */}
                  {order.isReturnRequested && order.status === "DELIVERED" && (
                    <span className="ml-2 px-2 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700 border border-orange-300">
                      🔔 Return Requested
                    </span>
                  )}
                </td>
                <td className="p-3">
                  ${order.totalPrice?.$numberDecimal || order.totalPrice}
                </td>
                <td className="p-3 flex gap-3">
                  <button
                    onClick={() => handleView(order)}
                    className="text-gray-600 hover:text-gray-800 cursor-pointer"
                    aria-label="View"
                  >
                    <FaEye size={20} />
                  </button>
                  <button
                    onClick={() => handleEdit(order)}
                    className="text-gray-600 hover:text-gray-800 cursor-pointer"
                    aria-label="Edit"
                  >
                    <FaEdit size={20} />
                  </button>
                  <button
                    onClick={() => handleSyncOrder(order._id)}
                    className="text-blue-600 hover:text-blue-800 cursor-pointer"
                    aria-label="Sync to Zoho"
                    title="Sync to Zoho"
                  >
                    <FaSync size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {!filteredOrders?.length && (
              <tr>
                <td colSpan="7" className="text-center p-4 text-gray-400">
                  No orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      <ViewOrderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        order={selectedOrder}
      />
      <EditOrderModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        order={selectedOrder}
        onSave={handleChangeStatus}
      />
    </div>
  );
}

export default OrderList;
