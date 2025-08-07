import React from "react";
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
        <div className="border-b pb-4 mb-6 flex items-center space-x-1">
          <FiCheckCircle className="text-green-500 text-3xl" />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Order Details</h1>
          </div>
        </div>

        {/* Order Details */}
        <div className="space-y-2 text-gray-700">
          <p>
            <span className="font-medium">Order ID:</span> {order._id}
          </p>
          <p>
            <span className="font-medium">Order Date:</span>{" "}
            {new Date(order.createdAt).toLocaleDateString()}
          </p>
          <p>
            <span className="font-medium">Order Status:</span>{" "}
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
            <span>{order.Payment[0]?.method}</span>
          </p>
          <p>
            <span className="font-medium">Payment Status:</span>{" "}
            <span
              className={`font-semibold ${
                order.Payment[0]?.status === "SUCCESS"
                  ? "text-green-600"
                  : order.Payment[0]?.status === "FAILED"
                  ? "text-red-600"
                  : "text-yellow-600"
              }`}
            >
              {order.Payment[0]?.status}
            </span>
          </p>
        </div>

        {/* Order Items */}
        <div className="mt-3">
          <h2 className="text-lg font-semibold text-gray-800 mb-1">
            Order Items
          </h2>
          <div className="space-y-4">
            {order.items?.map((item) => (
              <div
                key={item._id}
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border rounded-lg hover:shadow-md transition-shadow duration-200 bg-gray-50"
              >
                <div className="w-full">
                  <p className="text-gray-800 font-medium">
                    {item.product?.name || "Product Name"}
                  </p>
                  <p className="text-sm text-gray-600">
                    Quantity: {item.quantity} x ₹{item.price.toFixed(2)}
                  </p>

                  {/* Embroidery Information */}
                  {item.hasEmbroidery && item.embroideryData && (
                    <div className="mt-2 p-3 bg-white rounded-md border border-gray-200">
                      <p className="font-medium text-gray-700 mb-1">
                        Embroidery Details:
                      </p>
                      {(() => {
                        try {
                          const embroidery = JSON.parse(
                            item.embroideryData.replace(/\\"/g, '"')
                          );
                          return (
                            <div className="text-sm text-gray-600 space-y-1">
                              <p>Type: {embroidery.type}</p>
                              {embroidery.name && (
                                <p>Name: {embroidery.name}</p>
                              )}
                              {embroidery.designation && (
                                <p>Designation: {embroidery.designation}</p>
                              )}
                              {embroidery.placement && (
                                <p>Placement: {embroidery.placement}</p>
                              )}
                              {embroidery.logoUrl && (
                                <p className="flex items-center gap-2">
                                  <span className="font-medium">Logo: </span>
                                  <img
                                    src={embroidery.logoUrl}
                                    alt="Logo"
                                    className="w-12 h-12"
                                  />
                                </p>
                              )}
                              {embroidery.logoUrl &&
                                embroidery.logoPlacement && (
                                  <p>
                                    Logo Placement: {embroidery.logoPlacement}
                                  </p>
                                )}
                              {embroidery.color && (
                                <p>Color: {embroidery.color}</p>
                              )}
                              {embroidery.font && (
                                <p>Font: {embroidery.font}</p>
                              )}
                              {embroidery.price && (
                                <p>
                                  Additional Price: ₹
                                  {embroidery.price * item.quantity}
                                </p>
                              )}
                            </div>
                          );
                        } catch (e) {
                          return (
                            <p className="text-sm text-red-500">
                              Error parsing embroidery data
                            </p>
                          );
                        }
                      })()}
                    </div>
                  )}
                </div>

                <p className="text-gray-800 font-semibold sm:ml-4 mt-2 sm:mt-0">
                  ₹{(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Price Breakdown */}
        <div className="mt-5">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Price Breakdown
          </h2>
          <div className="bg-gray-100 p-4 rounded-lg space-y-2">
            <div className="flex justify-between text-gray-600">
              <p>Subtotal</p>
              <p>₹{order.totalPrice.toFixed(2)}</p>
            </div>
            <div className="flex justify-between text-gray-600">
              <p>Discount</p>
              <p className="text-red-600">-₹{order.discount.toFixed(2)}</p>
            </div>
            <div className="flex justify-between border-t pt-2 text-lg font-semibold">
              <p>Total</p>
              <p>₹{(order.totalPrice - order.discount).toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Close Button */}
        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-primary text-white rounded-lg cursor-pointer hover:scale-105 transition-colors duration-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewOrderModal;
