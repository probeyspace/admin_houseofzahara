import {
  FiCheckCircle,
  FiExternalLink,
  FiPackage,
  FiTruck,
  FiCloud,
  FiFileText,
  FiDownload,
} from "react-icons/fi";
import { toast } from "react-toastify";

const ViewOrderModal = ({ isOpen, onClose, order }) => {
  if (!isOpen || !order) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleDownloadInvoice = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/orders/${order._id}/invoice`,
        { credentials: "include" }
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.message || "Invoice not available for this order.");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${order._id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Failed to download invoice. Please try again.");
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
          <button
            onClick={handleDownloadInvoice}
            className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-dark text-sm font-medium rounded-lg hover:scale-105 transition cursor-pointer"
          >
            <FiDownload /> Download Invoice
          </button>
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
          {order?.zohoSalesOrderId && (
            <p>
              <span className="font-medium">Zoho Sales Order ID:</span>{" "}
              <span className="text-blue-600 font-semibold">
                {order.zohoSalesOrderId}
              </span>
            </p>
          )}
        </div>

        {/* External Systems - Zoho & Quiqup */}
        {(order?.zohoSalesOrderId || order?.quiqupOrderId) && (
          <div className="bg-slate-50 p-4 rounded-lg mb-6 border border-slate-200">
            <h2 className="text-lg font-semibold text-slate-800 mb-3 flex items-center">
              <FiCloud className="mr-2 text-blue-500" />
              External Systems
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Zoho Details */}
              {order?.zohoSalesOrderId && (
                <div className="bg-blue-50 p-3 rounded border border-blue-200">
                  <h3 className="text-sm font-semibold text-blue-800 mb-2 flex items-center">
                    <FiCloud className="mr-1" /> Zoho Inventory
                  </h3>
                  <div className="space-y-1 text-sm">
                    {order?.zohoSalesOrderId && (
                      <p className="text-blue-700">
                        <span className="font-medium">Sales Order:</span>{" "}
                        <span className="font-mono bg-blue-100 px-2 py-0.5 rounded text-xs">
                          {order.zohoSalesOrderId}
                        </span>
                      </p>
                    )}
                    {order?.zohoInvoiceId && (
                      <p className="text-blue-700">
                        <span className="font-medium">Invoice:</span>{" "}
                        <span className="font-mono bg-blue-100 px-2 py-0.5 rounded text-xs">
                          {order.zohoInvoiceId}
                        </span>
                      </p>
                    )}
                    {order?.zohoPackageId && (
                      <p className="text-blue-700">
                        <span className="font-medium">Package:</span>{" "}
                        <span className="font-mono bg-blue-100 px-2 py-0.5 rounded text-xs">
                          {order.zohoPackageId}
                        </span>
                      </p>
                    )}
                    {order?.zohoShipmentOrderId && (
                      <p className="text-blue-700">
                        <span className="font-medium">Shipment:</span>{" "}
                        <span className="font-mono bg-blue-100 px-2 py-0.5 rounded text-xs">
                          {order.zohoShipmentOrderId}
                        </span>
                      </p>
                    )}
                    {order?.zohoPaymentId && (
                      <p className="text-blue-700">
                        <span className="font-medium">Payment:</span>{" "}
                        <span className="font-mono bg-blue-100 px-2 py-0.5 rounded text-xs">
                          {order.zohoPaymentId}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Quiqup Details */}
              {order?.quiqupOrderId && (
                <div className="bg-green-50 p-3 rounded border border-green-200">
                  <h3 className="text-sm font-semibold text-green-800 mb-2 flex items-center">
                    <FiTruck className="mr-1" /> Quiqup Logistics
                  </h3>
                  <div className="space-y-1 text-sm">
                    <p className="text-green-700">
                      <span className="font-medium">Order ID:</span>{" "}
                      <span className="font-mono bg-green-100 px-2 py-0.5 rounded text-xs">
                        {order.quiqupOrderId}
                      </span>
                    </p>
                    {/* {order?.quiqupOrderUuid && (
                      <p className="text-green-700">
                        <span className="font-medium">UUID:</span>{" "}
                        <span className="font-mono text-xs text-green-600">
                          {order.quiqupOrderUuid.slice(0, 16)}...
                        </span>
                      </p>
                    )} */}
                    {order?.quiqupStatus && (
                      <p className="text-green-700">
                        <span className="font-medium">Status:</span>{" "}
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            order.quiqupStatus === "ready_for_collection" ||
                            order.quiqupStatus === "collected"
                              ? "bg-green-200 text-green-800"
                              : order.quiqupStatus === "delivered"
                              ? "bg-blue-200 text-blue-800"
                              : "bg-yellow-200 text-yellow-800"
                          }`}
                        >
                          {order.quiqupStatus.replace(/_/g, " ").toUpperCase()}
                        </span>
                      </p>
                    )}
                    {order?.quiqupTrackingUrl && (
                      <div className="mt-2 pt-2 border-t border-green-200">
                        <a
                          href={order.quiqupTrackingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-green-700 hover:text-green-900 text-sm font-medium"
                        >
                          <FiExternalLink className="mr-1" />
                          Open Tracking URL
                        </a>
                      </div>
                    )}
                    {/* AWB Label Download - Only show if order is ready_for_collection or beyond */}
                    {order?.quiqupOrderId && (
                      <div className="mt-2 pt-2 border-t border-green-200">
                        {(() => {
                          const canDownloadAWB = [
                            "ready_for_collection",
                            "collected",
                            "in_transit",
                            "delivered",
                          ].includes(order.quiqupStatus);
                          return canDownloadAWB ? (
                            <>
                              <a
                                href={`${
                                  import.meta.env.VITE_API_URL
                                }/orders/quiqup/${order._id}/awb`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center text-blue-700 hover:text-blue-900 text-sm font-medium"
                                title="Download shipping label (AWB) for printing"
                              >
                                <FiFileText className="mr-1" />
                                Download AWB Label (PDF)
                              </a>
                              <p className="text-xs text-green-600 mt-1">
                                Print and attach to parcel before pickup
                              </p>
                              {/* <p className="text-xs text-gray-500 mt-1 italic">
                                💡 Staging Note: AWB may not be available in
                                Quiqup staging environment.
                              </p> */}
                            </>
                          ) : (
                            <div className="text-yellow-700 text-sm">
                              <span className="font-medium">AWB:</span> Not
                              available yet
                              <p className="text-xs text-yellow-600 mt-1">
                                Mark order as SHIPPED to generate AWB
                              </p>
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

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

        {/* Return Request Info */}
        {order.isReturnRequested && (
          <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg mb-6">
            <h2 className="text-lg font-semibold text-orange-800 mb-2">
              Return Request Information
            </h2>
            <p className="text-orange-700">
              <span className="font-medium">Status:</span> Customer has
              requested a return
            </p>
            {order.status === "RETURNED" && (
              <>
                <p className="text-orange-700 mt-2">
                  <span className="font-medium">Order Status:</span>{" "}
                  <span className="text-green-600 font-semibold">
                    Return Approved & Processed
                  </span>
                </p>
              </>
            )}
          </div>
        )}

        {/* Return Tracking Info (Only when order is RETURNED) */}
        {order.status === "RETURNED" && (
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6">
            <h2 className="text-lg font-semibold text-blue-800 mb-3">
              Return Logistics Information
            </h2>

            {/* Quiqup Return Order Details */}
            {order.quiqupReturnOrderId ? (
              <div className="space-y-2">
                <p className="text-blue-700">
                  <span className="font-medium">Quiqup Return Order ID:</span>{" "}
                  <span className="font-mono bg-blue-100 px-2 py-1 rounded text-blue-800">
                    {order.quiqupReturnOrderId}
                  </span>
                </p>
                {/* {order.quiqupReturnOrderUuid && (
                  <p className="text-blue-700">
                    <span className="font-medium">UUID:</span>{" "}
                    <span className="font-mono text-sm">
                      {order.quiqupReturnOrderUuid}
                    </span>
                  </p>
                )} */}
                {order.quiqupReturnStatus && (
                  <p className="text-blue-700">
                    <span className="font-medium">Pickup Status:</span>{" "}
                    <span
                      className={`font-semibold ${
                        order.quiqupReturnStatus === "collected" ||
                        order.quiqupReturnStatus === "delivered"
                          ? "text-green-600"
                          : order.quiqupReturnStatus === "failed"
                          ? "text-red-600"
                          : "text-yellow-600"
                      }`}
                    >
                      {order.quiqupReturnStatus.toUpperCase()}
                    </span>
                  </p>
                )}
                {order.quiqupReturnTrackingUrl && (
                  <div className="mt-3 pt-3 border-t border-blue-200">
                    <p className="text-blue-700 mb-2">
                      <span className="font-medium">
                        Customer Tracking Link:
                      </span>
                    </p>
                    <a
                      href={order.quiqupReturnTrackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      Open Tracking URL
                    </a>
                    <p className="text-xs text-blue-600 mt-2 break-all">
                      {order.quiqupReturnTrackingUrl}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-yellow-600 italic">
                ⚠️ Return order not yet created in Quiqup. Approve the return to
                generate tracking.
              </p>
            )}
          </div>
        )}

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
