import { useState } from "react";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import SvgSpinner from "../../common/SvgSpinner";
import { createVariant } from "../../services/products";
import { addVariant } from "../../store/slices/productSlice";

function AddVariantModal({ isOpen, onClose, product }) {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    price: "",
    discountPrice: "",
    stock: "",
    sku: "",
    isActive: true,
    images: [],
    shade: "",
    size: "",
    finish: "",
    skinType: "",
    formulation: "",
    spf: "",
    fragrance: "",
    packaging: "",
    volume: "",
    weight: "",
    color: "",
    material: "",
    expiryDate: "",
  });

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === "checkbox") {
      setForm((prev) => ({ ...prev, [name]: checked }));
    } else if (type === "file") {
      setForm((prev) => ({ ...prev, images: Array.from(files) }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();

    // Basic fields
    formData.append("price", form.price);
    formData.append("discountPrice", form.discountPrice);
    formData.append("stock", form.stock);
    formData.append("sku", form.sku);
    formData.append("isActive", form.isActive);

    // Specs (as flat fields, backend builds the object)
    const specsFields = [
      "shade",
      "size",
      "finish",
      "skinType",
      "formulation",
      "spf",
      "fragrance",
      "packaging",
      "volume",
      "weight",
      "color",
      "material",
      "expiryDate",
    ];
    specsFields.forEach((field) => {
      if (form[field]) formData.append(field, form[field]);
    });

    //size is required
    if (!form.size || !form.price || !form.stock) {
      toast.error("Size, price and stock are required");
      return;
    }

    // Images
    form.images.forEach((file) => {
      formData.append("images", file);
    });

    setLoading(true);
    try {
      const response = await createVariant(product._id, formData);
      dispatch(addVariant(response.data));
      toast.success(response?.message || "Variant added successfully!");
      setForm({});
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Error adding variant");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-2xl p-6 rounded-xl relative">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">
          Add Variant for {product?.name}
        </h2>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 max-h-[80vh] overflow-y-auto pr-2"
        >
          <div className="grid grid-cols-2 gap-4">
            {[
              "price",
              "discountPrice",
              "stock",
              "sku",
              "shade",
              "size",
              "finish",
              "skinType",
              "formulation",
              "spf",
              "fragrance",
              "packaging",
              "volume",
              "weight",
              "color",
              "material",
            ].map((field) => (
              <input
                key={field}
                name={field}
                value={form[field]}
                onChange={handleChange}
                className="border border-gray-300 rounded p-2"
                placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
              />
            ))}

            <div className="flex flex-col">
              <span className="text-xs text-gray-600 mx-1">Expiry Date</span>
              <input
                type="date"
                name="expiryDate"
                value={form.expiryDate}
                onChange={handleChange}
                className="border border-gray-300 rounded p-2"
              />
            </div>
          </div>

          {/* isActive toggle */}
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

          {/* Image Upload */}
          <input
            type="file"
            name="images"
            multiple
            accept="image/*"
            onChange={handleChange}
            className="border border-gray-300 rounded p-2 w-full cursor-pointer"
            
          />

          {/* Submit & Cancel */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 cursor-pointer"
            >
              Cancel
            </button>
            <button
              disabled={loading}
              type="submit"
              className="bg-primary text-dark px-4 py-2 rounded hover:bg-primary/80 cursor-pointer"
            >
              {loading ? <SvgSpinner /> : "Add Variant"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddVariantModal;
