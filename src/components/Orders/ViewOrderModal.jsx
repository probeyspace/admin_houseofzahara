import { FiCheckCircle } from "react-icons/fi";

const ViewOrderModal = ({ isOpen, onClose, order }) => {
  if (!isOpen || !order) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 backdrop-blur-sm flex justify-center items-start z-50 overflow-y-auto py-8"
      onClick={handleBackdropClick}
    >
      <div className="max-w-4xl w-full bg-white rounded-lg shadow-lg p-6 md:p-8 mx-4">
        {/* Header */}
        <div className="border-b pb-4 mb-6 flex items-center space-x-2">
          <FiCheckCircle className="text-green-500 text-3xl" />
          <h1 className="text-2xl font-bold text-gray-800">Order Details</h1>
        </div>

        {/* Order Info */}
        <div className="space-y-2 text-gray-700 mb-6">
          <p>
            <span className="font-medium">Order ID:</span> {order._id}
          </p>
          <p>
            <span className="font-medium">Order Date:</span>{" "}
            {new Date(order.createdAt).toLocaleDateString()}
          </p>
          <p>
            <span className="font-medium">Status:</span>{" "}
            <span
              className={`font-semibold ${
                order.status === "DELIVERED"
                  ? "text-green-600"
                  : order.status === "CANCELLED"
                  ? "text-red-600"
                  : "text-yellow-600"
              }`}
            >
              {order.status}
            </span>
          </p>
          <p>
            <span className="font-medium">Payment Method:</span>{" "}
            {order?.paymentMethod}
          </p>
          <p>
            <span className="font-medium">Payment Status:</span>{" "}
            <span
              className={`font-semibold ${
                order?.paymentStatus === "PAID"
                  ? "text-green-600"
                  : order?.paymentStatus === "FAILED"
                  ? "text-red-600"
                  : "text-yellow-600"
              }`}
            >
              {order?.paymentStatus}
            </span>
          </p>
        </div>

        {/* User Info */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            Customer Info
          </h2>
          <p>{order.user?.name}</p>
          <p>{order.user?.email}</p>
          <p>{order.user?.phone}</p>
        </div>

        {/* Address */}
        {order.address && (
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              Shipping Address
            </h2>
            <p>
              {order.address.houseNo}, {order.address.street}
            </p>
            <p>
              {order.address.city}, {order.address.state} -{" "}
              {order.address.zipCode}
            </p>
            <p>{order.address.country}</p>
          </div>
        )}

        {/* Items */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            Order Items
          </h2>
          <div className="space-y-3">
            {order.items?.map((item) => (
              <div
                key={item._id}
                className="flex justify-between items-center p-3 border rounded-lg bg-gray-50"
              >
                <div>
                  <p className="text-gray-800 font-medium">
                    {item.product?.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    Qty: {item.quantity} × ${Number(item.price.$numberDecimal)}
                  </p>
                </div>
                <p className="text-gray-800 font-semibold">
                  $
                  {(Number(item.price.$numberDecimal) * item.quantity).toFixed(
                    2
                  )}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Price Breakdown */}
        <div className="bg-gray-100 p-4 rounded-lg mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            Price Breakdown
          </h2>
          <div className="flex justify-between text-gray-600">
            <p>Subtotal</p>
            <p>${Number(order.totalPrice.$numberDecimal)}</p>
          </div>
          <div className="flex justify-between text-gray-600">
            <p>Shipping Charges</p>
            <p>-${Number(order.shipment)}</p>
          </div>
          <div className="flex justify-between text-gray-600">
            <p>Discount</p>
            <p>-${Number(order.discount.$numberDecimal)}</p>
          </div>
          <div className="flex justify-between border-t pt-2 text-lg font-semibold">
            <p>Total</p>
            <p>
              $
              {(
                Number(order.totalPrice.$numberDecimal) -
                Number(order.discount.$numberDecimal)
              ).toFixed(2)}
            </p>
          </div>
        </div>

        {/* Close Button */}
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-primary text-dark cursor-pointer rounded-lg hover:scale-105 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewOrderModal;
