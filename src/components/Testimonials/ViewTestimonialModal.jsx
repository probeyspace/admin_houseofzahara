import { useEffect, useState } from "react";
import { FaTimes } from "react-icons/fa";

const ViewTestimonialModal = ({ isOpen, onClose, testimonial }) => {
  const [isBrowser, setIsBrowser] = useState(false);

  useEffect(() => {
    setIsBrowser(true);
  }, []);

  if (!isOpen || !isBrowser || !testimonial) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-lg w-11/12 md:w-1/2 lg:w-1/3 p-6 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 cursor-pointer"
        >
          <FaTimes size={20} />
        </button>

        {/* Modal Content */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-800">
            {testimonial.name}
          </h2>

          {/* Description */}
          <div className="mb-4 flex gap-3">
            <label className="block text-gray-700 font-medium mb-1">
              Description:
            </label>
            <p className="text-gray-600">{testimonial.description}</p>
          </div>

          {/* City */}
          <div className="mb-4 flex gap-3">
            <label className="block text-gray-700 font-medium mb-1">
              City:
            </label>
            <p className="text-gray-600">{testimonial.city}</p>
          </div>

          {/* Rating */}
          <div className="mb-4 flex gap-3">
            <label className="block text-gray-700 font-medium mb-1">
              Rating:
            </label>
            <div className="flex">
              {Array.from({ length: testimonial.rating }, (_, i) => (
                <span key={i} className="text-yellow-500">
                  ★
                </span>
              ))}
            </div>
          </div>

          {/* Image (if available) */}
          {testimonial.imageUrl && (
            <div className="w-full h-60">
              <img
                src={testimonial.imageUrl}
                alt={testimonial.name}
                className="w-full h-full object-cover rounded-md"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewTestimonialModal;
