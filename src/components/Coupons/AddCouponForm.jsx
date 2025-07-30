import React, { useState } from "react";
import api from "../../Api/api";
import { toast } from "react-toastify";

const AddCouponForm = () => {
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
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-md rounded-lg">
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
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
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
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
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
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
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
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <button
            type="submit"
            className="cursor-pointer bg-primary text-white py-2 px-4 rounded-md hover:scale-105 transition duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Create Coupon
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddCouponForm;
