import { useState } from "react";
import { createVariant } from "../../services/products";
import { toast } from "react-toastify";

function AddVariantModal({ isOpen, onClose, productId }) {
  const [form, setForm] = useState({
    shade: "",
    size: "",
    finish: "",
    skinType: "",
    formulation: "",
    spf: "",
    fragrance: "",
    packaging: "",
    price: "",
    stock: "",
    sku: "",
    isActive: true,
    images: [],
  });

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === "checkbox") {
      setForm({ ...form, [name]: checked });
    } else if (type === "file") {
      setForm({ ...form, images: Array.from(files) });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (key === "images") {
        value.forEach((file) => formData.append("images", file));
      } else {
        formData.append(key, value);
      }
    });

    try {
      const response = await createVariant(productId, formData);
      toast.success(response?.message || "Variant added successfully!");
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Error adding variant");
      console.error(err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-2xl p-6 rounded-xl relative">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">
          Add Variant
        </h2>
        <form
          onSubmit={handleSubmit}
          className="space-y-4 max-h-[80vh] overflow-y-auto pr-2"
        >
          <div className="grid grid-cols-2 gap-4">
            {[
              "shade",
              "size",
              "finish",
              "skinType",
              "formulation",
              "spf",
              "fragrance",
              "packaging",
              "price",
              "discountPrice",
              "stock",
              "sku",
            ].map((field) => (
              <input
                key={field}
                name={field}
                value={form[field]}
                onChange={handleChange}
                className="border border-gray-300 rounded p-2"
                placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                required={field !== "spf" && field !== "fragrance"}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Active</label>
            <input
              type="checkbox"
              name="isActive"
              checked={form.isActive}
              onChange={handleChange}
              className="h-5 w-4 cursor-pointer"
            />
          </div>
          <input
            type="file"
            name="images"
            multiple
            accept="image/*"
            onChange={handleChange}
            className="border border-gray-300 rounded p-2 cursor-pointer"
          />
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-primary text-dark px-4 py-2 rounded hover:bg-primary/80 cursor-pointer"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddVariantModal;
