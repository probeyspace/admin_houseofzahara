import { useState } from "react";
import api from "../../Api/api";
import { toast } from "react-toastify";

const AddCouponModal = ({ show, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    code: "",
    discountType: "Percentage", // Default value
    discountValue: "",
    minOrderValue: "",
    expiresAt: "",
    isHidden: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await api.post("/promoCode", formData);
      toast.success(response.data.message || "Coupon created successfully");
      setFormData({
        code: "",
        discountType: "Percentage",
        discountValue: "",
        minOrderValue: "",
        expiresAt: "",
        isHidden: false,
      });
      onUpdate();
      onClose(); // Close modal after submission
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Failed to create coupon");
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 backdrop-blur-sm bg-black/30 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md relative p-6">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-600 hover:text-black text-3xl font-bold"
        >
          &times;
        </button>

        <h2 className="text-2xl font-bold mb-6 text-center">Add New Coupon</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Coupon Code
            </label>
            <input
              type="text"
              name="code"
              value={formData.code}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Discount Type
            </label>
            <select
              name="discountType"
              value={formData.discountType}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            >
              <option value="Percentage">Percentage</option>
              <option value="Fixed">Fixed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Discount Value
            </label>
            <input
              type="number"
              name="discountValue"
              value={formData.discountValue}
              onChange={handleChange}
              min={0}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Minimum Order Value
            </label>
            <input
              type="number"
              name="minOrderValue"
              value={formData.minOrderValue}
              onChange={handleChange}
              min={0}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Expiry Date
            </label>
            <input
              type="date"
              name="expiresAt"
              value={formData.expiresAt}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isHidden"
              name="isHidden"
              checked={formData.isHidden}
              onChange={handleChange}
              className="w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <label
              htmlFor="isHidden"
              className="text-sm font-medium text-gray-700"
            >
              Is Influencer Coupon ?
            </label>
          </div>

          {formData.isHidden && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Influencer Email
              </label>
              <input
                type="email"
                name="influencerEmail"
                value={formData.influencerEmail}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                required={formData.isHidden}
              />
            </div>
          )}

          <div className="text-center">
            <button
              type="submit"
              className="bg-primary text-dark py-2 px-6 rounded hover:scale-105 cursor-pointer transition transform duration-300"
            >
              Create Coupon
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCouponModal;
