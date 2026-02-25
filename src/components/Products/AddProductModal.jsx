import { useState, useMemo } from "react";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { createProduct } from "../../services/products";
import SvgSpinner from "../../common/SvgSpinner";
import { addProductData } from "../../store/slices/productSlice";
import { useBrand } from "../../Hooks/useBrand";

// ── Helper: toggle item in an array ────────────────────────────────────────
const toggleArrayItem = (arr, item) =>
  arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item];

// ── Reusable bilingual textarea block ──────────────────────────────────────
const BilingualTextarea = ({
  label,
  fieldKey,
  value,
  onChange,
  lang,
  rows = 3,
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}{" "}
      <span className="text-gray-400 text-xs">
        ({lang === "en" ? "English" : "Arabic"})
      </span>
    </label>
    <textarea
      value={value?.[lang] || ""}
      onChange={(e) => onChange(fieldKey, { ...value, [lang]: e.target.value })}
      placeholder={`Enter ${label} in ${lang === "en" ? "English" : "Arabic"}`}
      className="w-full border p-2 rounded text-sm"
      rows={rows}
    />
  </div>
);

// ── Multi-checkbox group ────────────────────────────────────────────────────
const CheckboxGroup = ({ label, options, selected, onToggle }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <label
          key={opt}
          className={`flex items-center gap-1 px-2 py-1 rounded-full border text-xs cursor-pointer transition-colors ${
            selected.includes(opt)
              ? "bg-blue-100 border-blue-400 text-blue-700"
              : "border-gray-300 text-gray-600 hover:border-gray-400"
          }`}
        >
          <input
            type="checkbox"
            className="hidden"
            checked={selected.includes(opt)}
            onChange={() => onToggle(opt)}
          />
          {opt}
        </label>
      ))}
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════
const AddProductModal = ({ isOpen, onClose }) => {
  const [activeLanguage, setActiveLanguage] = useState("en");
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: { en: "", ar: "" },
    brandName: "",
    productType: "",
    countryOfOrigin: "",
    masterCategory: "",
    // Multiple selections
    categories: [], // array of category IDs
    subcategories: [], // array of subcategory IDs
    // Bilingual structured fields
    howToUse: { en: "", ar: "" },
    addedBenefits: { en: "", ar: "" },
    visibleResults: { en: "", ar: "" },
    primaryPurpose: { en: "", ar: "" },
    // Simple text
    antiAgingEffect: "",
    // Array fields
    skinTypes: [],
    skinConcerns: [],
    ingredientsRaw: "", // comma-separated input, converted to array on submit
    // Media
    thumbnails: [],
    video: null,
    YTVideoUrl: "",
  });

  const categories = useSelector((state) => state.category);
  const subcategories = useSelector((state) => state.subCategory);
  const masterCategories = useSelector((state) => state.masterCategory);
  const { brands } = useBrand();
  const dispatch = useDispatch();

  // ── Derive skin type / concern options from DB subcategories (same as frontend filter) ──
  const skinTypeCategory = useMemo(
    () => categories?.find((c) => c.name?.toLowerCase().includes("skin type")),
    [categories]
  );
  const skinConcernCategory = useMemo(
    () => categories?.find((c) => c.name?.toLowerCase().includes("concern")),
    [categories]
  );
  const SKIN_TYPE_OPTIONS = useMemo(
    () =>
      skinTypeCategory
        ? subcategories
            ?.filter((s) => s.category?._id === skinTypeCategory._id)
            .map((s) => s.name) ?? []
        : [],
    [skinTypeCategory, subcategories]
  );
  const SKIN_CONCERN_OPTIONS = useMemo(
    () =>
      skinConcernCategory
        ? subcategories
            ?.filter((s) => s.category?._id === skinConcernCategory._id)
            .map((s) => s.name) ?? []
        : [],
    [skinConcernCategory, subcategories]
  );

  // Filter categories that belong to selected masterCategory
  const filteredCategories = categories.filter(
    (cat) => cat.masterCategory?._id === formData.masterCategory
  );

  // Filter subcategories that belong to ANY of the selected categories
  const filteredSubcategories = subcategories.filter((sub) =>
    formData.categories.includes(sub.category?._id)
  );

  // ── Field change helpers ─────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBilingualChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleMasterCategoryChange = (e) => {
    // Reset categories + subcategories when master category changes
    setFormData((prev) => ({
      ...prev,
      masterCategory: e.target.value,
      categories: [],
      subcategories: [],
    }));
  };

  const toggleCategory = (catId) => {
    setFormData((prev) => {
      const newCategories = toggleArrayItem(prev.categories, catId);
      // Remove subcategories that no longer belong to any selected category
      const validSubIds = subcategories
        .filter((sub) => newCategories.includes(sub.category?._id))
        .map((sub) => sub._id);
      const newSubcategories = prev.subcategories.filter((id) =>
        validSubIds.includes(id)
      );
      return {
        ...prev,
        categories: newCategories,
        subcategories: newSubcategories,
      };
    });
  };

  const toggleSubcategory = (subId) => {
    setFormData((prev) => ({
      ...prev,
      subcategories: toggleArrayItem(prev.subcategories, subId),
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 2) {
      toast.error("Only 2 thumbnail images are allowed.");
      return;
    }
    setFormData((prev) => ({ ...prev, thumbnails: files }));
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size > 50 * 1024 * 1024) {
      toast.error("Video file size must be less than 50MB.");
      return;
    }
    setFormData((prev) => ({ ...prev, video: file }));
  };

  // ── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.categories.length === 0) {
      toast.error("Please select at least one category.");
      return;
    }
    if (formData.subcategories.length === 0) {
      toast.error("Please select at least one subcategory.");
      return;
    }
    setLoading(true);

    const data = new FormData();
    data.append("name", formData.name);
    data.append("description", JSON.stringify(formData.description));
    data.append("brandName", formData.brandName);
    data.append("productType", formData.productType);
    data.append("countryOfOrigin", formData.countryOfOrigin);
    data.append("masterCategory", formData.masterCategory);

    // Send arrays as JSON strings
    data.append("categories", JSON.stringify(formData.categories));
    data.append("subcategories", JSON.stringify(formData.subcategories));

    // Bilingual fields
    data.append("howToUse", JSON.stringify(formData.howToUse));
    data.append("addedBenefits", JSON.stringify(formData.addedBenefits));
    data.append("visibleResults", JSON.stringify(formData.visibleResults));
    data.append("primaryPurpose", JSON.stringify(formData.primaryPurpose));

    // Simple fields
    if (formData.antiAgingEffect)
      data.append("antiAgingEffect", formData.antiAgingEffect);
    if (formData.YTVideoUrl) data.append("YTVideoUrl", formData.YTVideoUrl);

    // Array fields
    const ingredientsArray = formData.ingredientsRaw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    data.append("ingredients", JSON.stringify(ingredientsArray));
    data.append("skinTypes", JSON.stringify(formData.skinTypes));
    data.append("skinConcerns", JSON.stringify(formData.skinConcerns));

    // Files
    formData.thumbnails.forEach((file) => data.append("thumbnails", file));
    if (formData.video) data.append("video", formData.video);

    try {
      const response = await createProduct(data);
      dispatch(addProductData(response.data));
      toast.success(response?.message || "Product created successfully.");
      onClose();
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to create product."
      );
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-black/30 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-[650px] max-w-full h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Add Product</h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* ── Language Tabs ── */}
          <div className="flex gap-2 border-b border-gray-300">
            {["en", "ar"].map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => setActiveLanguage(lang)}
                className={`px-4 py-2 font-medium transition-colors cursor-pointer ${
                  activeLanguage === lang
                    ? "border-b-2 border-blue-500 text-blue-600"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                {lang === "en" ? "English" : "Arabic"}
              </button>
            ))}
          </div>

          {/* ── Basic Info ── */}
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              name="name"
              placeholder="Product Name *"
              value={formData.name}
              onChange={handleChange}
              className="border p-2 rounded col-span-2"
              required
            />
            <select
              name="brandName"
              value={formData.brandName}
              onChange={handleChange}
              className="border p-2 rounded"
              required
            >
              <option value="">Select Brand *</option>
              {brands?.map((brand) => (
                <option key={brand._id} value={brand.name}>
                  {brand.name}
                </option>
              ))}
            </select>
            <input
              type="text"
              name="productType"
              placeholder="Product Type"
              value={formData.productType}
              onChange={handleChange}
              className="border p-2 rounded"
            />
            <input
              type="text"
              name="countryOfOrigin"
              placeholder="Country of Origin (e.g. Turkey)"
              value={formData.countryOfOrigin}
              onChange={handleChange}
              className="border p-2 rounded col-span-2"
            />
          </div>

          {/* ── Bilingual Description ── */}
          <BilingualTextarea
            label="Description"
            fieldKey="description"
            value={formData.description}
            onChange={handleBilingualChange}
            lang={activeLanguage}
            rows={3}
          />

          {/* ── Bilingual Product Info ── */}
          <div className="border rounded-lg p-3 space-y-3 bg-gray-50">
            <p className="text-sm font-semibold text-gray-700">
              Product Details ({activeLanguage === "en" ? "English" : "Arabic"})
            </p>
            <BilingualTextarea
              label="How to Use"
              fieldKey="howToUse"
              value={formData.howToUse}
              onChange={handleBilingualChange}
              lang={activeLanguage}
              rows={2}
            />
            <BilingualTextarea
              label="Added Benefits"
              fieldKey="addedBenefits"
              value={formData.addedBenefits}
              onChange={handleBilingualChange}
              lang={activeLanguage}
              rows={2}
            />
            <BilingualTextarea
              label="Visible Results"
              fieldKey="visibleResults"
              value={formData.visibleResults}
              onChange={handleBilingualChange}
              lang={activeLanguage}
              rows={2}
            />
            <BilingualTextarea
              label="Primary Purpose"
              fieldKey="primaryPurpose"
              value={formData.primaryPurpose}
              onChange={handleBilingualChange}
              lang={activeLanguage}
              rows={2}
            />
          </div>

          {/* ── Anti-Aging Effect ── */}
          <input
            type="text"
            name="antiAgingEffect"
            placeholder="Anti-Aging Effect (e.g. Anti Aging Effect)"
            value={formData.antiAgingEffect}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />

          {/* ── Ingredients ── */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ingredients{" "}
              <span className="text-gray-400 text-xs">(comma-separated)</span>
            </label>
            <textarea
              name="ingredientsRaw"
              placeholder="AQUA, GLYCERIN, TOCOPHEROL, CITRUS SINENSIS PEEL EXTRACT..."
              value={formData.ingredientsRaw}
              onChange={handleChange}
              className="w-full border p-2 rounded text-sm"
              rows={3}
            />
          </div>

          {/* ── Skin Types ── */}
          <CheckboxGroup
            label="Skin Types"
            options={SKIN_TYPE_OPTIONS}
            selected={formData.skinTypes}
            onToggle={(opt) =>
              setFormData((prev) => ({
                ...prev,
                skinTypes: toggleArrayItem(prev.skinTypes, opt),
              }))
            }
          />

          {/* ── Skin Concerns ── */}
          <CheckboxGroup
            label="Skin Concerns"
            options={SKIN_CONCERN_OPTIONS}
            selected={formData.skinConcerns}
            onToggle={(opt) =>
              setFormData((prev) => ({
                ...prev,
                skinConcerns: toggleArrayItem(prev.skinConcerns, opt),
              }))
            }
          />

          {/* ── Master Category ── */}
          <select
            name="masterCategory"
            value={formData.masterCategory}
            onChange={handleMasterCategoryChange}
            className="w-full border p-2 rounded"
            required
          >
            <option value="">Select Master Category *</option>
            {masterCategories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>

          {/* ── Categories (multi-checkbox) ── */}
          {formData.masterCategory && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categories *{" "}
                <span className="text-xs text-gray-400">
                  (select all that apply)
                </span>
              </label>
              <div className="flex flex-wrap gap-2">
                {filteredCategories.map((cat) => (
                  <label
                    key={cat._id}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-full border text-sm cursor-pointer transition-colors ${
                      formData.categories.includes(cat._id)
                        ? "bg-blue-100 border-blue-400 text-blue-700 font-medium"
                        : "border-gray-300 text-gray-600 hover:border-gray-400"
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={formData.categories.includes(cat._id)}
                      onChange={() => toggleCategory(cat._id)}
                    />
                    {cat.name}
                  </label>
                ))}
              </div>
              {filteredCategories.length === 0 && (
                <p className="text-xs text-gray-400 mt-1">
                  No categories found for this master category.
                </p>
              )}
            </div>
          )}

          {/* ── Subcategories (multi-checkbox, grouped by category) ── */}
          {formData.categories.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subcategories *{" "}
                <span className="text-xs text-gray-400">
                  (select all that apply)
                </span>
              </label>
              {formData.categories.map((catId) => {
                const cat = categories.find((c) => c._id === catId);
                const catSubs = filteredSubcategories.filter(
                  (sub) => sub.category?._id === catId
                );
                if (!catSubs.length) return null;
                return (
                  <div key={catId} className="mb-3">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                      {cat?.name}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {catSubs.map((sub) => (
                        <label
                          key={sub._id}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-full border text-sm cursor-pointer transition-colors ${
                            formData.subcategories.includes(sub._id)
                              ? "bg-green-100 border-green-400 text-green-700 font-medium"
                              : "border-gray-300 text-gray-600 hover:border-gray-400"
                          }`}
                        >
                          <input
                            type="checkbox"
                            className="hidden"
                            checked={formData.subcategories.includes(sub._id)}
                            onChange={() => toggleSubcategory(sub._id)}
                          />
                          {sub.name}
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── Media ── */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Thumbnail Images (Max 2) *
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              className="border border-gray-300 px-3 py-2 rounded-md w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Video (Optional){" "}
              <span className="text-xs text-gray-500">
                MP4, WebM, MOV | Max 50MB
              </span>
            </label>
            <input
              type="file"
              accept="video/mp4,video/webm,video/quicktime"
              onChange={handleVideoChange}
              className="border border-gray-300 px-3 py-2 rounded-md w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              YouTube Video URL (How to Use){" "}
              <span className="text-xs text-gray-500">Optional</span>
            </label>
            <input
              type="url"
              name="YTVideoUrl"
              placeholder="https://www.youtube.com/watch?v=..."
              value={formData.YTVideoUrl}
              onChange={handleChange}
              className="w-full border border-gray-300 px-3 py-2 rounded-md"
            />
          </div>

          {/* ── Actions ── */}
          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              className="bg-primary text-dark px-4 py-2 rounded flex-1 cursor-pointer"
              disabled={loading}
            >
              {loading ? <SvgSpinner /> : "Create Product"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-400 text-dark px-4 py-2 rounded flex-1 cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductModal;
