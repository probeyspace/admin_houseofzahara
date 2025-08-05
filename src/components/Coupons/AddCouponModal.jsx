import { useState } from "react";
import api from "../../Api/api";
import { toast } from "react-toastify";

const AddCouponModal = ({ show, onClose }) => {
  const [formData, setFormData] = useState({
    code: "",
    discount: "",
    expiry: "",
    minOrder: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await api.post("/promoCode", formData);
      toast.success(response.data.message || "Coupon created successfully");
      setFormData({ code: "", discount: "", expiry: "", minOrder: "" });
      onClose(); // Close modal after submission
    } catch (error) {
      console.error(error);
      toast.error("Failed to create coupon");
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
              Discount
            </label>
            <input
              type="number"
              name="discount"
              value={formData.discount}
              onChange={handleChange}
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
              name="expiry"
              value={formData.expiry}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Minimum Order Amount
            </label>
            <input
              type="number"
              name="minOrder"
              value={formData.minOrder}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div className="text-center">
            <button
              type="submit"
              className="bg-primary text-dark py-2 px-6 rounded hover:scale-105 transition transform duration-300"
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
