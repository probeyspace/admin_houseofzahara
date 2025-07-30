import { FaTimes } from "react-icons/fa";
import { Link } from "react-router-dom";

const ViewBrandModal = ({ isOpen, onClose, brand }) => {
  if (!isOpen || !brand) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm shadow-md flex items-center justify-center z-50">
      <div className="rounded-lg p-6 w-full max-w-md  bg-white">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 cursor-pointer"
        >
          <FaTimes size={20} />
        </button>

        <h2 className="text-2xl font-bold mb-4">Brand Details</h2>

        {/* Brand Image */}
        {brand.imageUrl && (
          <div className="mb-4">
            <img
              src={brand.imageUrl}
              alt={brand.name}
              className="w-full h-48 object-cover rounded-lg"
            />
          </div>
        )}

        {/* Brand Details */}
        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-1">Name</label>
            <p className="text-gray-600">{brand.name}</p>
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Description
            </label>
            <p className="text-gray-600">{brand.description}</p>
          </div>

          {brand.website && (
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Website
              </label>
              <Link
                to={brand.website}
                target="_blank"
                className="text-primary hover:underline"
              >
                {brand.website || "N/A"}
              </Link>
            </div>
          )}

          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Status
            </label>
            <span
              className={`px-2 py-1 rounded-full text-sm ${
                brand.isActive
                  ? "bg-green-100 text-green-600"
                  : "bg-red-100 text-red-600"
              }`}
            >
              {brand.isActive ? "Active" : "Inactive"}
            </span>
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Created At
            </label>
            <p className="text-gray-600">
              {new Date(brand.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewBrandModal;
