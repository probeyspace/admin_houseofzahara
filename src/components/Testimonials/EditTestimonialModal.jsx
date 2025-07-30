import { useEffect, useState } from "react";
import api from "../../Api/api";
import { FaCloudUploadAlt } from "react-icons/fa";
import { toast } from "react-toastify";

function EditTestimonialModal({
  isOpen,
  onClose,
  testimonial,
  fetchTestimonials,
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [rating, setRating] = useState(1);
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);

  useEffect(() => {
    if (testimonial) {
      setName(testimonial.name || "");
      setDescription(testimonial.description || "");
      setRating(testimonial.rating || 1);
    }
  }, [testimonial]);
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!image) {
        toast.error(
          " Image is required for updating testimonial. Please select an image."
        );
      }
      const formData = new FormData();
      formData.append("image", image);
      formData.append("name", name);

      formData.append("description", description);
      formData.append("rating", rating);
      await api.put(`testimonials/${testimonial.id}`, formData);
      fetchTestimonials(); // Update the testimonials list after successful update
      onClose();
    } catch (error) {
      console.error("Error updating testimonial:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center border-b pb-2">
          <h2 className="text-xl font-semibold">Edit Testimonial</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4">
          <div className="mb-4">
            <label className="block text-gray-700 font-medium">Name</label>
            <input
              type="text"
              className="border border-gray-300 p-2 w-full rounded-lg focus:ring focus:ring-primary outline-none"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-medium">
              Description
            </label>
            <textarea
              className="border border-gray-300 p-2 w-full rounded-lg focus:ring focus:ring-primary outline-none"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-medium">Rating</label>
            <select
              className="border border-gray-300 p-2 w-full rounded-lg focus:ring focus:ring-primary outline-none"
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
            >
              {[1, 2, 3, 4, 5].map((num) => (
                <option key={num} value={num}>
                  {num}
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
                  className="hidden"
                  onChange={handleImageChange}
                />
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition cursor-pointer"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditTestimonialModal;
