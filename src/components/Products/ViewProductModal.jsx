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
                    <strong>ID:</strong> {product._id}
                  </p>
                  <p>
                    <strong>Name:</strong> {product.name}
                  </p>
                  <p>
                    <strong>Brand:</strong> {product.brandName}
                  </p>
                  <p>
                    <strong>Category:</strong>{" "}
                    {product.categoryId?.name || "N/A"}
                  </p>
                  <p className="md:col-span-2">
                    <strong>Description:</strong> {product.description}
                  </p>
                  <p>
                    <strong>Created At:</strong>{" "}
                    {new Date(product.createdAt).toLocaleDateString()}
                  </p>
                </div>

                {/* Images */}
                {product.thumbnailImages?.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-semibold mb-2">
                      Product Thumbnail Images for Product Card
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {product.thumbnailImages.map((img) => (
                        <img
                          key={img._id}
                          src={img.url}
                          alt={img.altText || "Product Image"}
                          className="w-[150px] h-[150px] object-contain rounded shadow-sm"
                        />
                      ))}
                    </div>
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
