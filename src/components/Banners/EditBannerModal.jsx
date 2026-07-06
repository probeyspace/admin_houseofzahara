import { useState, useEffect } from "react";
import api from "../../Api/api";
import { toast } from "react-toastify";

const EditBannerModal = ({ isOpen, onClose, bannerData, fetchBanner }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    offer: "",
    imageAlt: "",
    isActive: false,
    image: null,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (bannerData) {
      setFormData({
        title: bannerData.title,
        description: bannerData.description,
        offer: bannerData.offer,
        imageAlt: bannerData.imageAlt || "",
        isActive: bannerData.isActive,
        image: null,
      });
    }
  }, [bannerData]);

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
      formDataToSend.append("imageAlt", formData.imageAlt);
      formDataToSend.append("isActive", formData.isActive);
      if (formData.image) {
        formDataToSend.append("image", formData.image);
      }
      await api.put(`/banner/${bannerData._id}`, formDataToSend);
      toast.success("Banner updated successfully!");
      fetchBanner(); // Refresh banners list
      onClose(); // Close the modal
    } catch (error) {
      console.error("Error updating banner:", error);
      toast.error("Failed to update banner. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const isVideo =
    (formData.image && formData.image.type.startsWith("video/")) ||
    (!formData.image && bannerData?.mediaType === "video");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">Edit Banner</h2>
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
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              required
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
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              rows="3"
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
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            />
          </div>
          {!isVideo && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Image Alt Tag
              </label>
              <input
                type="text"
                name="imageAlt"
                value={formData.imageAlt}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              />
            </div>
          )}
          <div className="flex items-center">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-900">
              Is Active
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Banner Image / Video
            </label>
            <input
              type="file"
              name="image"
              onChange={handleImageChange}
              className="mt-1 block w-full text-sm text-gray-900"
              accept="image/*,video/*"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-500 hover:bg-gray-600 cursor-pointer text-white px-4 py-2 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-primary hover:bg-primary/80 cursor-pointer text-dark px-4 py-2 rounded-md"
            >
              {loading ? "Updating..." : "Update Banner"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditBannerModal;
