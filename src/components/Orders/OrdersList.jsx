import { useState } from "react";
import { FaEye, FaEdit } from "react-icons/fa";
import { useSelector } from "react-redux";
import ViewOrderModal from "./ViewOrderModal";
import EditOrderModal from "./EditOrderModal";
import useOrders from "../../Hooks/useOrders";
import api from "../../Api/api";
import { toast } from "react-toastify";
import { FiDownload } from "react-icons/fi";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

function OrderList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useOrders();
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

  // Filter orders
  const filteredOrders = orders?.filter((order) => {
    const search = searchTerm?.toLowerCase();

    const matchesOrderId = order?._id?.toLowerCase().includes(search);
    const matchesCustomerName = order?.user?.name
      ?.toLowerCase()
      .includes(search);

    const matchesSearch = matchesOrderId || matchesCustomerName;

    const matchesStatus = statusFilter ? order.status === statusFilter : true;
    const matchesDateRange =
      (!startDate || new Date(order.createdAt) >= new Date(startDate)) &&
      (!endDate || new Date(order.createdAt) <= new Date(endDate));

    return matchesSearch && matchesStatus && matchesDateRange;
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
        "Payment Method": order.Payment?.[0]?.method || "N/A",
        "Payment Status": order.Payment?.[0]?.status || "N/A",
        "Total Price": order.totalPrice,
        Discount: order.discount,
        "Product Name": item.product?.name || "N/A",
        Brand: item.product?.brandName || "N/A",
        Qty: item.quantity,
        Color: item.color?.color || "N/A",
        SKU: item.color?.sku || "N/A",
        Price: item.price,
        "Discounted Price":
          item.color?.discountPrice || item.color?.price || "N/A",
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
      { wch: 20 }, // Brand
      { wch: 5 }, // Qty
      { wch: 15 }, // Color
      { wch: 10 }, // SKU
      { wch: 15 }, // Price
      { wch: 20 }, // Discounted Price
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
    <div>
      <h2 className="text-3xl font-semibold mb-4 text-center">coming soon</h2>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-4 bg-white shadow-md rounded-lg overflow-x-auto">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-end gap-3 mb-4">
        <input
          type="text"
          placeholder="Search by Order ID or Name..."
          className="border border-gray-400 p-2 rounded-lg w-full sm:w-60 text-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-400 p-2 rounded-lg w-full sm:w-48 text-sm"
        >
          <option value="">All Statuses</option>
          {uniqueStatuses.map((status) => (
            <option key={status} value={status}>
              {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
            </option>
          ))}
        </select>

        <input
          type="date"
          className="border border-gray-400 p-2 rounded-lg text-sm w-full sm:w-48"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <input
          type="date"
          className="border border-gray-400 p-2 rounded-lg text-sm w-full sm:w-48"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />

        <button
          title="Export Order List to Excel"
          className="bg-primary hover:bg-primary/80 text-white py-2.5 px-5 rounded-md cursor-pointer"
          onClick={exportToExcel}
        >
          <FiDownload className="text-lg" />
        </button>
      </div>

      {/* Orders Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm rounded-lg shadow-md">
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
                <td className="p-3 font-medium">{order._id.slice(0, 8)}...</td>
                <td className="p-3">{order?.user?.name || "Unknown"}</td>
                <td className="p-3">
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      order.status === "PROCESSING"
                        ? "bg-blue-100 text-primary/70"
                        : order.status === "CANCELLED"
                        ? "bg-red-100 text-primary"
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
                </td>

                <td className="p-3">₹{order.totalPrice}</td>
                <td className="p-3 flex gap-3">
                  <button
                    onClick={() => handleView(order)}
                    className="text-primary hover:text-primary/80 cursor-pointer"
                    aria-label="View"
                  >
                    <FaEye size={20} />
                  </button>
                  <button
                    onClick={() => handleEdit(order)}
                    className="text-primary hover:text-primary/80 cursor-pointer"
                    aria-label="Edit"
                  >
                    <FaEdit size={20} />
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
