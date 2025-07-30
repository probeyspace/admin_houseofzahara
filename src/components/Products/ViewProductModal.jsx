import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { FaTimes } from "react-icons/fa";

function ViewProductModal({ isOpen, onClose, product }) {
  if (!product) return null;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-full p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-3xl bg-white rounded-lg shadow-lg p-6 relative">
                {/* Close Button */}
                <button
                  className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                  onClick={onClose}
                >
                  <FaTimes size={18} />
                </button>

                {/* Modal Header */}
                <Dialog.Title
                  as="h2"
                  className="text-xl font-bold text-gray-800 mb-4"
                >
                  Product Details
                </Dialog.Title>

                {/* Product Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                  <p>
                    <strong>ID:</strong> {product.id}
                  </p>
                  <p>
                    <strong>Name:</strong> {product.name}
                  </p>
                  <p>
                    <strong>Brand:</strong> {product.brandName}
                  </p>
                  <p>
                    <strong>Category:</strong> {product.category?.name || "N/A"}
                  </p>
                  <p>
                    <strong>Material:</strong> {product.material}
                  </p>
                  <p>
                    <strong>Style:</strong> {product.style}
                  </p>
                  <p>
                    <strong>Region:</strong> {product.artisanRegion}
                  </p>
                  <p>
                    <strong>Dimension:</strong> {product.dimension}
                  </p>
                  <p>
                    <strong>Weight:</strong> {product.weight}g
                  </p>
                  <p>
                    <strong>Exchangeable:</strong>{" "}
                    {product.isExchangeable ? "Yes" : "No"}
                  </p>
                  <p>
                    <strong>Refundable:</strong>{" "}
                    {product.isRefundable ? "Yes" : "No"}
                  </p>
                  <p>
                    <strong>Created At:</strong>{" "}
                    {new Date(product.createdAt).toLocaleDateString()}
                  </p>
                  <p className="md:col-span-2">
                    <strong>Description:</strong> {product.description}
                  </p>
                </div>

                {/* Tags */}
                {product.tags?.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-semibold mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {product.tags.map((tag) => (
                        <span
                          key={tag.id}
                          className="bg-gray-100 border border-gray-300 text-sm px-3 py-1 rounded"
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Colors */}
                {product.colors?.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-semibold mb-2">Color Variants</h4>
                    <div className="space-y-2">
                      {product.colors.map((c) => (
                        <div
                          key={c.id}
                          className="flex flex-wrap items-center gap-4 border border-gray-200 p-2 rounded"
                        >
                          <span>
                            <strong>Color:</strong> {c.color}
                          </span>
                          <span>
                            <strong>SKU:</strong> {c.sku}
                          </span>
                          <span>
                            <strong>Stock:</strong> {c.stock}
                          </span>
                          <span>
                            <strong>Price:</strong> ₹{c.price}
                          </span>
                          <span>
                            <strong>Discount:</strong> ₹{c.discountPrice}
                          </span>
                          <span className="flex items-center gap-1">
                            <strong>Hex:</strong>
                            <span
                              className="w-4 h-4 rounded-full border"
                              style={{ backgroundColor: c.hex }}
                            />
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Images */}
                {product.images?.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-semibold mb-2">Product Images</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-2 gap-3">
                      {product.images.map((img) => (
                        <img
                          key={img.id}
                          src={img.url}
                          alt={img.altText || "Product Image"}
                          className="w-full h-32 object-cover rounded shadow-sm"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Video */}
                {product.videoUrl && (
                  <div className="mt-6">
                    <h4 className="font-semibold mb-2">Product Video</h4>
                    <video
                      controls
                      src={product.videoUrl}
                      className="w-full rounded shadow"
                    />
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

export default ViewProductModal;
