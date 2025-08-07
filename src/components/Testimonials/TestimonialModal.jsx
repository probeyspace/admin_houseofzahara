import { useState } from "react";
import { FaCloudUploadAlt } from "react-icons/fa";
import SvgSpinner from "../../common/SvgSpinner";
import api from "../../Api/api";
import { toast } from "react-toastify";

const TestimonialModal = ({ show, onClose, onSuccess }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [city, setCity] = useState("");
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(false);

  if (!show) return null;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!name || !description || !city || rating === 0 || !image) {
      toast.warn("All fields including image and rating are required");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("city", city);
    formData.append("rating", rating);
    formData.append("image", image);

    try {
      await api.post("/testimonials", formData);
      toast.success("Testimonial created successfully");
      // Reset fields
      setName("");
      setDescription("");
      setCity("");
      setRating(0);
      setImage(null);
      setPreview(null);
      onSuccess();
      onClose(); // Close modal
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error creating testimonial");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="bg-white max-w-md w-full p-5 rounded-lg shadow-lg relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute cursor-pointer top-3 right-3 text-gray-500 hover:text-black text-3xl font-bold"
        >
          &times;
        </button>

        <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">
          Create Testimonial
        </h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Name */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-md focus:ring focus:ring-blue-300"
              placeholder="Enter name"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="3"
              required
              className="w-full px-4 py-2 border rounded-md focus:ring focus:ring-blue-300"
              placeholder="Enter testimonial description"
            ></textarea>
          </div>

          {/* City */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">City</label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-md focus:ring focus:ring-blue-300"
              placeholder="Enter city"
            />
          </div>

          {/* Rating */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Rating
            </label>
            <select
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              required
              className="w-full px-4 py-2 border rounded-md focus:ring focus:ring-blue-300"
            >
              <option value={0}>Select rating</option>
              {[1, 2, 3, 4, 5].map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Upload Image
            </label>
            <div className="flex items-center gap-4">
              <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-md flex items-center gap-2">
                <FaCloudUploadAlt />
                Upload Image
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </label>
              {preview && (
                <img
                  src={preview}
                  alt="Preview"
                  className="w-16 h-16 rounded-md object-cover border"
                />
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="text-center">
            <button
              type="submit"
              disabled={loading}
              className="bg-primary cursor-pointer hover:scale-105 transition duration-300 text-dark px-6 py-2 rounded-md font-medium"
            >
              {!loading ? "Create Testimonial" : <SvgSpinner />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TestimonialModal;
