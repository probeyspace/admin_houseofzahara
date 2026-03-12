import React, { useState, useEffect } from "react";
import { FaSave } from "react-icons/fa"; // Save icon
import { useDispatch } from "react-redux";
import { changeStatus } from "../../store/slices/orderSlice";
import { toast } from "react-toastify";

const EditOrderModal = ({ isOpen, onClose, order, onSave }) => {
  const [status, setStatus] = useState(order?.status || "");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (order?.status) {
      setStatus(order.status);
    }
  }, [order]);

  const dispatch = useDispatch();

  // Handle save
  const handleSave = async () => {
    if (!status) {
      toast.warn("Please select a status.");
      return;
    }

    setLoading(true);
    try {
      await onSave(order._id, status);
      dispatch(changeStatus({ id: order._id, status }));

      onClose(); // Close the modal after saving
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("Failed to update order status. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex justify-center items-center z-50">
      {/* Modal Content */}
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6 mx-4">
        {/* Modal Header */}
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Edit Order Status
        </h2>

        {/* Modal Body */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Order ID
            </label>
            <p className="mt-1 text-gray-600">{order?._id}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Current Status
            </label>
            <p className="mt-1 text-gray-600">{order?.status}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              New Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="" disabled>
                Select Status
              </option>
              {(() => {
                const current = order?.status;
                const validTransitions = {
                  PENDING: ["PENDING", "PROCESSING", "CANCELLED"],
                  PROCESSING: ["PROCESSING", "SHIPPED", "CANCELLED"],
                  SHIPPED: ["SHIPPED", "DELIVERED", "RETURNED"],
                  DELIVERED: ["DELIVERED", "RETURNED"],
                  CANCELLED: ["CANCELLED"],
                  RETURNED: ["RETURNED"],
                };
                const allowed = current
                  ? validTransitions[current] || [current]
                  : [];

                const allStatuses = [
                  { value: "PENDING", label: "Pending" },
                  { value: "PROCESSING", label: "Processing" },
                  { value: "SHIPPED", label: "Shipped" },
                  { value: "DELIVERED", label: "Delivered" },
                  { value: "CANCELLED", label: "Cancelled" },
                  { value: "RETURNED", label: "Returned" },
                ];

                return allStatuses
                  .filter((s) => allowed.includes(s.value))
                  .map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ));
              })()}
            </select>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="mt-6 flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded-md text-gray-700 hover:bg-gray-300 transition-colors cursor-pointer duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 bg-primary text-dark  hover:bg-primary/80 rounded-md flex items-center cursor-pointer transition-colors duration-200"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white"></div>
            ) : (
              <>
                <FaSave className="mr-2" />
                Save
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditOrderModal;
