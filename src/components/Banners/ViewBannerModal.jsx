import React from "react";

const ViewBannerModal = ({ isOpen, onClose, banner }) => {
  if (!isOpen || !banner) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-start z-50 overflow-y-auto py-8"
      onClick={handleBackdropClick}
    >
      <div className="max-w-4xl w-full bg-white rounded-lg shadow-lg p-6 md:p-8 mx-4">
        {/* Header */}
        <div className="border-b pb-4 mb-6 flex items-center space-x-1">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Banner Details</h1>
          </div>
        </div>

        {/* Banner Details */}
        <div className="space-y-2 text-gray-700">
          <p>
            <span className="font-medium">Title:</span> {banner.title}
          </p>
          <p>
            <span className="font-medium">Description:</span>{" "}
            {banner.description}
          </p>
          <p>
            <span className="font-medium">Offer:</span> {banner.offer}
          </p>
          <p>
            <span className="font-medium">Status:</span>{" "}
            <span
              className={`font-semibold ${
                banner.isActive ? "text-green-600" : "text-red-600"
              }`}
            >
              {banner.isActive ? "Active" : "Inactive"}
            </span>
          </p>
          {banner.mediaType !== "video" && banner.imageAlt && (
            <p>
              <span className="font-medium">Image Alt Tag:</span> {banner.imageAlt}
            </p>
          )}
        </div>

        {/* Banner Image */}
        <div className="mt-3">
          <h2 className="text-lg font-semibold text-gray-800 mb-1">Media</h2>
          {banner.imageUrl && (
            banner.mediaType === "video" || banner.imageUrl.match(/\.(mp4|webm|ogg|mov)($|\?)/i) ? (
              <video
                src={banner.imageUrl}
                controls
                className="w-full h-64 object-cover rounded-lg"
              />
            ) : (
              <img
                src={banner.imageUrl}
                alt={banner.imageAlt || banner.title}
                className="w-full h-64 object-cover rounded-lg"
              />
            )
          )}
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

export default ViewBannerModal;
