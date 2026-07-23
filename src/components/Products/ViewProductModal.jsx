import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { FaTimes, FaGlobe } from "react-icons/fa";
import { Link } from "react-router-dom";

function ViewProductModal({ isOpen, onClose, product }) {
  if (!product) return null;

  // Bilingual fields may hold Quill HTML (new) or plain text (legacy)
  const renderHtmlValue = (html, className = "") =>
    html ? (
      <span
        className={`[&_p]:inline-block [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:pl-4 [&_ol]:pl-4 ${className}`}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    ) : (
      <span>N/A</span>
    );

  const renderBilingual = (field) => {
    if (!field) return "N/A";
    if (typeof field === "string") return renderHtmlValue(field);
    if (typeof field === "object") {
      return (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold bg-gray-100 px-1 rounded">
              EN
            </span>
            {renderHtmlValue(field.en)}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold bg-gray-100 px-1 rounded">
              AR
            </span>
            {renderHtmlValue(field.ar, "font-arabic")}
          </div>
        </div>
      );
    }
    return "N/A";
  };

  const renderArray = (arr, fieldName = "name") => {
    if (!Array.isArray(arr) || arr.length === 0) return "N/A";
    return arr
      .map((item) => (typeof item === "object" ? item[fieldName] : item))
      .join(", ");
  };

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
          <div className="fixed inset-0 backdrop-blur-sm bg-black/30" />
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
              <Dialog.Panel className="w-full max-w-4xl bg-white rounded-lg shadow-lg p-4 md:p-7 relative max-h-[90vh] overflow-y-auto">
                {/* Close Button */}
                <button
                  className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 cursor-pointer z-10"
                  onClick={onClose}
                >
                  <FaTimes size={18} />
                </button>

                {/* Modal Header */}
                <Dialog.Title
                  as="h2"
                  className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4"
                >
                  Product: {product.name}
                </Dialog.Title>

                <div className="space-y-8">
                  {/* Basic Info */}
                  <section>
                    <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
                      <div className="w-1 h-6 bg-primary rounded-full"></div>
                      Basic Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-sm">
                      <div className="md:col-span-2 bg-gray-50 p-3 rounded">
                        <strong className="block text-gray-500 mb-1">
                          Description
                        </strong>
                        <div className="text-gray-700">
                          {renderBilingual(product.description)}
                        </div>
                      </div>

                      <div>
                        <strong className="text-gray-500">ID:</strong>{" "}
                        {product._id}
                      </div>
                      <div>
                        <strong className="text-gray-500">Brand:</strong>{" "}
                        {product.brandName}
                      </div>
                      <div>
                        <strong className="text-gray-500">
                          Master Category:
                        </strong>{" "}
                        {product.masterCategory?.name || "N/A"}
                      </div>
                      <div>
                        <strong className="text-gray-500">Categories:</strong>{" "}
                        {renderArray(product.categories || product.category)}
                      </div>
                      <div>
                        <strong className="text-gray-500">
                          SubCategories:
                        </strong>{" "}
                        {renderArray(
                          product.subcategories || product.subcategory
                        )}
                      </div>
                      <div>
                        <strong className="text-gray-500">Slug:</strong>{" "}
                        {product.slug}
                      </div>
                    </div>
                  </section>

                  {/* Technical & Content info */}
                  <section className="bg-gray-50 p-5 rounded-lg border border-gray-100">
                    <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
                      <div className="w-1 h-6 bg-primary rounded-full"></div>
                      Product Details (Bilingual)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                      <div>
                        <strong className="block text-gray-500 mb-1 uppercase text-[10px] tracking-wider">
                          How To Use
                        </strong>
                        <div className="bg-white p-3 rounded border border-gray-200">
                          {renderBilingual(product.howToUse)}
                        </div>
                      </div>
                      <div>
                        <strong className="block text-gray-500 mb-1 uppercase text-[10px] tracking-wider">
                          Key Benefits
                        </strong>
                        <div className="bg-white p-3 rounded border border-gray-200">
                          {renderBilingual({ en: product.keyBenefits_en, ar: product.keyBenefits_ar })}
                        </div>
                      </div>
                      <div>
                        <strong className="block text-gray-500 mb-1 uppercase text-[10px] tracking-wider">
                          Added Benefits
                        </strong>
                        <div className="bg-white p-3 rounded border border-gray-200">
                          {renderBilingual(product.addedBenefits)}
                        </div>
                      </div>
                      <div>
                        <strong className="block text-gray-500 mb-1 uppercase text-[10px] tracking-wider">
                          Visible Results
                        </strong>
                        <div className="bg-white p-3 rounded border border-gray-200">
                          {renderBilingual(product.visibleResults)}
                        </div>
                      </div>
                      <div>
                        <strong className="block text-gray-500 mb-1 uppercase text-[10px] tracking-wider">
                          Primary Purpose
                        </strong>
                        <div className="bg-white p-3 rounded border border-gray-200">
                          {renderBilingual(product.primaryPurpose)}
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Attributes and Specs */}
                  <section>
                    <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
                      <div className="w-1 h-6 bg-primary rounded-full"></div>
                      Attributes & Specs
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="bg-white p-3 border rounded shadow-sm">
                        <strong className="block text-gray-500 mb-2">
                          Skin Types
                        </strong>
                        <div className="flex flex-wrap gap-2">
                          {product.skinTypes?.map((t) => (
                            <span
                              key={t}
                              className="px-2 py-1 bg-blue-50 text-blue-600 rounded-md text-[11px] font-medium"
                            >
                              {t}
                            </span>
                          )) || "N/A"}
                        </div>
                      </div>
                      <div className="bg-white p-3 border rounded shadow-sm">
                        <strong className="block text-gray-500 mb-2">
                          Skin Concerns
                        </strong>
                        <div className="flex flex-wrap gap-2">
                          {product.skinConcerns?.map((c) => (
                            <span
                              key={c}
                              className="px-2 py-1 bg-green-50 text-green-600 rounded-md text-[11px] font-medium"
                            >
                              {c}
                            </span>
                          )) || "N/A"}
                        </div>
                      </div>
                      <div className="md:col-span-2">
                        <strong className="text-gray-500">Ingredients:</strong>
                        <p className="mt-1 text-gray-600 leading-relaxed italic bg-gray-50 p-2 rounded border border-dashed border-gray-300">
                          {renderArray(product.ingredients)}
                        </p>
                      </div>
                      <div>
                        <strong className="text-gray-500">Origin:</strong>{" "}
                        {product.countryOfOrigin || "N/A"}
                      </div>
                      <div>
                        <strong className="text-gray-500">
                          Anti-Aging Effect:
                        </strong>{" "}
                        {product.antiAgingEffect || "N/A"}
                      </div>
                    </div>
                  </section>

                  {/* Images & Video */}
                  <section>
                    <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
                      <div className="w-1 h-6 bg-primary rounded-full"></div>
                      Media Assets
                    </h3>
                    <div className="space-y-4">
                      {product.thumbnailImages?.length > 0 && (
                        <div>
                          <p className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">
                            Product Thumbnails
                          </p>
                          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                            {product.thumbnailImages.map((img) => (
                              <div
                                key={img._id}
                                className="border rounded relative group overflow-hidden bg-gray-50"
                              >
                                <img
                                  src={img.url}
                                  alt={img.altText || "Product Image"}
                                  className="w-full aspect-square object-contain p-2"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {product.videoUrl && (
                        <div className="mt-4">
                          <p className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">
                            Product Video
                          </p>
                          <video
                            src={product.videoUrl}
                            controls
                            className="max-w-xs h-auto rounded border"
                          />
                        </div>
                      )}
                    </div>
                  </section>

                  {/* Meta */}
                  <section className="pt-6 border-t flex flex-wrap gap-6 text-[11px] text-gray-400 italic">
                    <p>
                      <strong>Created At:</strong>{" "}
                      {new Date(product.createdAt).toLocaleString()}
                    </p>
                    <p>
                      <strong>Updated At:</strong>{" "}
                      {new Date(product.updatedAt).toLocaleString()}
                    </p>
                  </section>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

export default ViewProductModal;
