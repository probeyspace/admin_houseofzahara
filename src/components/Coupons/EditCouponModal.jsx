import React, { useState, useEffect } from "react";
import api from "../../Api/api";
import { toast } from "react-toastify";

const EditCouponModal = ({ isOpen, onClose, couponData, onUpdate }) => {
  const [formData, setFormData] = useState({
    code: "",
    discount: "",
    expiry: "",
    minOrder: "",
  });

  useEffect(() => {
    if (couponData) {
      setFormData({
        code: couponData.code,
        discount: couponData.discount,
        expiry: couponData.expiry.split("T")[0], // Format for date input
        minOrder: couponData.minOrder,
      });
    }
  }, [couponData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const id = couponData.id;
    console.log(couponData);
    try {
      await api.put(`/promoCode/${id}`, formData);
      toast.success("Coupon updated successfully");
      onUpdate(); // Refresh the coupon list
      onClose(); // Close the modal
    } catch (error) {
      console.error("Error updating coupon:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-md w-96">
        <h2 className="text-xl font-bold mb-4 text-center">Edit Coupon</h2>
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
              className="mt-1 block w-full px-3 py-2 border rounded-md"
              disabled
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
              className="mt-1 block w-full px-3 py-2 border rounded-md"
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
              className="mt-1 block w-full px-3 py-2 border rounded-md"
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
              className="mt-1 block w-full px-3 py-2 border rounded-md"
            />
          </div>
          <div className="flex justify-between">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-500 text-white py-2 px-4 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-primary text-white py-2 px-4 rounded-md hover:scale-105 transition"
            >
              Update Coupon
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCouponModal;
