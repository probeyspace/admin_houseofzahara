import { useState } from "react";
import { FaChevronDown } from "react-icons/fa";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import SvgSpinner from "../../common/SvgSpinner";
import { createVariant } from "../../services/products";
import { addVariant } from "../../store/slices/productSlice";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const INITIAL_FORM = {
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
};

const INITIAL_SECTIONS = {
  core: true,
  beautySpecs: false,
  techSpecs: false,
  lifecycle: false,
  media: false,
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const SectionHeader = ({ title, isOpen, onToggle, badge }) => (
  <button
    type="button"
    onClick={onToggle}
    className="w-full flex items-center justify-between py-2.5 px-4 text-left bg-gray-50 hover:bg-gray-100 transition-colors"
  >
    <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide flex items-center gap-2">
      {title}
      {badge && (
        <span className="px-1.5 py-0.5 rounded-full bg-red-100 text-red-600 text-[10px] font-bold normal-case">
          {badge}
        </span>
      )}
    </span>
    <FaChevronDown
      size={11}
      className={`text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
    />
  </button>
);

const LabeledInput = ({ label, name, type = "text", value, onChange, required, placeholder }) => (
  <div className="flex flex-col gap-0.5">
    <label className="text-xs text-gray-500 block">
      {label}
      {required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      placeholder={placeholder}
      className="border border-gray-300 rounded p-2 w-full text-sm focus:outline-none focus:ring-1 focus:ring-primary"
    />
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

function AddVariantModal({ isOpen, onClose, product }) {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);
  const [openSections, setOpenSections] = useState(INITIAL_SECTIONS);

  const toggleSection = (key) =>
    setOpenSections((p) => ({ ...p, [key]: !p[key] }));

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === "checkbox") {
      setForm((p) => ({ ...p, [name]: checked }));
    } else if (type === "file") {
      setForm((p) => ({ ...p, images: Array.from(files) }));
    } else {
      setForm((p) => ({ ...p, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields and auto-expand the relevant section
    if (!form.price || !form.stock) {
      toast.error("Price and stock are required");
      setOpenSections((p) => ({ ...p, core: true }));
      return;
    }
    if (!form.size) {
      toast.error("Size is required");
      setOpenSections((p) => ({ ...p, beautySpecs: true }));
      return;
    }

    const formData = new FormData();
    formData.append("price", form.price);
    formData.append("discountPrice", form.discountPrice);
    formData.append("stock", form.stock);
    formData.append("sku", form.sku);
    formData.append("isActive", form.isActive);

    const specsFields = [
      "shade", "size", "finish", "skinType", "formulation", "spf",
      "fragrance", "packaging", "volume", "weight", "color", "material", "expiryDate",
    ];
    specsFields.forEach((field) => {
      if (form[field]) formData.append(field, form[field]);
    });

    form.images.forEach((file) => formData.append("images", file));

    setLoading(true);
    try {
      const response = await createVariant(product._id, formData);
      dispatch(addVariant(response.data));
      toast.success(response?.message || "Variant added successfully!");
      setForm(INITIAL_FORM);
      setOpenSections(INITIAL_SECTIONS);
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
      <div className="bg-white w-full max-w-2xl rounded-xl relative flex flex-col max-h-[92vh] shadow-xl">

        {/* Fixed header */}
        <div className="px-6 pt-5 pb-4 border-b border-gray-100 flex items-start justify-between shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Add Variant</h2>
            {product?.name && (
              <p className="text-xs text-gray-400 mt-0.5">{product.name}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none cursor-pointer mt-0.5"
          >
            &times;
          </button>
        </div>

        {/* Scrollable form body */}
        <form
          onSubmit={handleSubmit}
          id="add-variant-form"
          className="overflow-y-auto flex-1 px-6 py-4 space-y-3"
        >
          {/* ── Core Fields ── */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <SectionHeader
              title="Core Fields"
              isOpen={openSections.core}
              onToggle={() => toggleSection("core")}
              badge="required"
            />
            {openSections.core && (
              <div className="px-4 pb-4 pt-3 grid grid-cols-2 gap-3">
                <LabeledInput
                  label="Price"
                  name="price"
                  type="number"
                  value={form.price}
                  onChange={handleChange}
                  required
                />
                <LabeledInput
                  label="Discount Price"
                  name="discountPrice"
                  type="number"
                  value={form.discountPrice}
                  onChange={handleChange}
                />
                <LabeledInput
                  label="Stock"
                  name="stock"
                  type="number"
                  value={form.stock}
                  onChange={handleChange}
                  required
                />
                <LabeledInput
                  label="SKU"
                  name="sku"
                  value={form.sku}
                  onChange={handleChange}
                />
              </div>
            )}
          </div>

          {/* ── Beauty Specs ── */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <SectionHeader
              title="Beauty Specs"
              isOpen={openSections.beautySpecs}
              onToggle={() => toggleSection("beautySpecs")}
              badge="size required"
            />
            {openSections.beautySpecs && (
              <div className="px-4 pb-4 pt-3 grid grid-cols-2 gap-3">
                <LabeledInput label="Shade" name="shade" value={form.shade} onChange={handleChange} />
                <LabeledInput label="Size" name="size" value={form.size} onChange={handleChange} required />
                <LabeledInput label="Color" name="color" value={form.color} onChange={handleChange} />
                <LabeledInput label="Finish" name="finish" value={form.finish} onChange={handleChange} />
                <LabeledInput label="Fragrance" name="fragrance" value={form.fragrance} onChange={handleChange} />
                <LabeledInput label="Skin Type" name="skinType" value={form.skinType} onChange={handleChange} />
              </div>
            )}
          </div>

          {/* ── Technical Specs ── */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <SectionHeader
              title="Technical Specs"
              isOpen={openSections.techSpecs}
              onToggle={() => toggleSection("techSpecs")}
            />
            {openSections.techSpecs && (
              <div className="px-4 pb-4 pt-3 grid grid-cols-2 gap-3">
                <LabeledInput label="Formulation" name="formulation" value={form.formulation} onChange={handleChange} />
                <LabeledInput label="SPF" name="spf" value={form.spf} onChange={handleChange} />
                <LabeledInput label="Volume" name="volume" value={form.volume} onChange={handleChange} />
                <LabeledInput label="Weight" name="weight" value={form.weight} onChange={handleChange} />
                <LabeledInput label="Packaging" name="packaging" value={form.packaging} onChange={handleChange} />
                <LabeledInput label="Material" name="material" value={form.material} onChange={handleChange} />
              </div>
            )}
          </div>

          {/* ── Lifecycle & Status ── */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <SectionHeader
              title="Lifecycle & Status"
              isOpen={openSections.lifecycle}
              onToggle={() => toggleSection("lifecycle")}
            />
            {openSections.lifecycle && (
              <div className="px-4 pb-4 pt-3 space-y-3">
                <div className="flex flex-col gap-0.5">
                  <label className="text-xs text-gray-500 block">Expiry Date</label>
                  <input
                    type="date"
                    name="expiryDate"
                    value={form.expiryDate}
                    onChange={handleChange}
                    className="border border-gray-300 rounded p-2 w-full text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={form.isActive}
                    onChange={handleChange}
                    className="h-4 w-4 cursor-pointer"
                  />
                  <span className="text-sm text-gray-700">Active</span>
                </label>
              </div>
            )}
          </div>

          {/* ── Media ── */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <SectionHeader
              title="Media (Images)"
              isOpen={openSections.media}
              onToggle={() => toggleSection("media")}
            />
            {openSections.media && (
              <div className="px-4 pb-4 pt-3">
                <p className="text-xs text-gray-400 mb-2">Upload one or more images for this variant</p>
                <input
                  type="file"
                  name="images"
                  multiple
                  accept="image/*"
                  onChange={handleChange}
                  className="border border-gray-300 rounded p-2 w-full text-sm cursor-pointer"
                />
                {form.images.length > 0 && (
                  <p className="text-xs text-gray-500 mt-1.5">
                    {form.images.length} file{form.images.length !== 1 ? "s" : ""} selected
                  </p>
                )}
              </div>
            )}
          </div>
        </form>

        {/* Fixed footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 cursor-pointer flex-1 text-sm transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="add-variant-form"
            disabled={loading}
            className="bg-primary text-dark px-4 py-2 rounded hover:bg-primary/80 cursor-pointer flex-1 text-sm font-medium disabled:opacity-50 transition-colors"
          >
            {loading ? <SvgSpinner /> : "Add Variant"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddVariantModal;
