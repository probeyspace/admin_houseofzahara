import { useState } from "react";
import api from "../../Api/api";
import { toast } from "react-toastify";

const BannerModal = ({ show, onClose }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    offer: "",
    isActive: false,
    image: null,
  });

  const [loading, setLoading] = useState(false);

  if (!show) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("offer", formData.offer);
      formDataToSend.append("isActive", formData.isActive);
      if (formData.image) {
        formDataToSend.append("image", formData.image);
      }

      const response = await api.post("/banner", formDataToSend);
      toast.success("Banner created successfully!");
      setFormData({
        title: "",
        description: "",
        offer: "",
        isActive: false,
        image: null,
      });
      onClose(); // Close modal
    } catch (error) {
      console.error("Error creating banner:", error);
      toast.error("Failed to create banner");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="bg-white max-w-lg w-full p-6 rounded-lg shadow-lg relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-black text-3xl font-bold"
        >
          &times;
        </button>

        <h2 className="text-2xl font-bold mb-6 text-center">Add New Banner</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Offer
            </label>
            <input
              type="text"
              name="offer"
              value={formData.offer}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="h-4 w-4 text-primary border-gray-300 rounded"
            />
            <label className="ml-2 text-sm text-gray-700">Is Active</label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Banner Image
            </label>
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleImageChange}
              className="mt-1 block w-full text-sm text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-primary hover:file:bg-primary/10"
            />
          </div>

          <div className="text-center">
            <button
              type="submit"
              disabled={loading}
              className="bg-primary text-dark py-2 px-6 rounded-md hover:scale-105 transition-transform duration-300"
            >
              {loading ? "Creating..." : "Create Banner"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BannerModal;
