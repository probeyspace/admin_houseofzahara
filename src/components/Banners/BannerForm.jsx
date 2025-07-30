import React, { useState } from "react";
import api from "../../Api/api";
import { toast } from "react-toastify";

const BannerForm = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    offer: "",
    isActive: false,
    image: null,
  });

  const [loading, setLoading] = useState(false); // For loading state during submission

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // Handle image file selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create a FormData object to send the file and other form data
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("offer", formData.offer);
      formDataToSend.append("isActive", formData.isActive);
      if (formData.image) {
        formDataToSend.append("image", formData.image); // Append the image file
      }

      // Send the form data to the backend
      const response = await api.post("/banner", formDataToSend);

      toast.success("Banner created successfully!");

      // Reset the form after successful submission
      setFormData({
        title: "",
        description: "",
        offer: "",
        isActive: false,
        image: null,
      });
    } catch (error) {
      console.error("Error creating banner:", error);
      toast.error("Failed to create banner. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">Add New Banner</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Title
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            rows="3"
          />
        </div>

        {/* Offer */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Offer
          </label>
          <input
            type="text"
            name="offer"
            value={formData.offer}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Is Active */}
        <div className="flex items-center">
          <input
            type="checkbox"
            name="isActive"
            checked={formData.isActive}
            onChange={handleChange}
            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
          />
          <label className="ml-2 block text-sm text-gray-900">Is Active</label>
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Banner Image
          </label>
          <input
            type="file"
            name="image"
            onChange={handleImageChange}
            className="mt-1 block w-full text-sm text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-primary  hover:file:bg-primary/10 "
            accept="image/*" // Only allow image files
          />
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            disabled={loading}
            className="cursor-pointer bg-primary text-white py-2 px-4 rounded-md hover:scale-105 transition duration-300 focus:outline-none focus:ring-2 focus:ring-primary/25 focus:ring-offset-2"
          >
            {loading ? "Creating..." : "Create Banner"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BannerForm;
