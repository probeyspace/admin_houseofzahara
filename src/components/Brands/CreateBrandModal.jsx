import { useState } from "react";
import { useBrand } from "../../Hooks/useBrand";

const CreateBrandModal = ({ isOpen, onClose, fetchBrands }) => {
  const { createBrand } = useBrand();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    website: "",
    isActive: "true",
  });
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("description", formData.description);
      if (formData.website) {
        formDataToSend.append("website", formData.website);
      }
      formDataToSend.append("isActive", formData.isActive);
      if (image) {
        formDataToSend.append("image", image);
      }

      await createBrand(formDataToSend);
      fetchBrands();
      onClose();
      setFormData({
        name: "",
        description: "",
        website: "",
        isActive: "true",
      });
      setImage(null);
    } catch (error) {
      console.error("Error creating brand:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Create New Brand</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
              rows="3"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">
              Website (Optional)
            </label>
            <input
              type="url"
              name="website"
              value={formData.website}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="https://example.com"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Status</label>
            <select
              name="isActive"
              value={formData.isActive}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/80"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Brand"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateBrandModal;
