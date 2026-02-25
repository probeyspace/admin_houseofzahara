import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { updateProduct } from "../../services/products";
import SvgSpinner from "../../common/SvgSpinner";
import { updateProductData } from "../../store/slices/productSlice";

// ── Helpers ──────────────────────────────────────────────────────────────────
const toggleArrayItem = (arr, item) =>
  arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item];

// Extract ID from either a populated object or a raw string ID
const extractId = (val) => {
  if (!val) return null;
  if (typeof val === "string") return val;
  if (typeof val === "object" && val._id) return val._id;
  return null;
};

// Normalize a bilingual field from the product data
const normalizeBilingual = (val) => {
  if (!val) return { en: "", ar: "" };
  if (typeof val === "object" && !Array.isArray(val)) {
    return { en: val.en || "", ar: val.ar || "" };
  }
  if (typeof val === "string") {
    try {
      const parsed = JSON.parse(val);
      if (parsed && typeof parsed === "object")
        return { en: parsed.en || "", ar: parsed.ar || "" };
    } catch {}
    return { en: val, ar: "" };
  }
  return { en: "", ar: "" };
};

// ── Reusable Components ──────────────────────────────────────────────────────
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

// ═════════════════════════════════════════════════════════════════════════════
const EditProductModal = ({ isOpen, onClose, productData }) => {
  const [activeLanguage, setActiveLanguage] = useState("en");
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: { en: "", ar: "" },
    brandName: "",
    productType: "",
    countryOfOrigin: "",
    masterCategory: "",
    categories: [],
    subcategories: [],
    howToUse: { en: "", ar: "" },
    addedBenefits: { en: "", ar: "" },
    visibleResults: { en: "", ar: "" },
    primaryPurpose: { en: "", ar: "" },
    antiAgingEffect: "",
    skinTypes: [],
    skinConcerns: [],
    ingredientsRaw: "",
    thumbnails: [],
    video: null,
    YTVideoUrl: "",
  });

  const categories = useSelector((state) => state.category);
  const subcategories = useSelector((state) => state.subCategory);
  const masterCategories = useSelector((state) => state.masterCategory);

  // \u2500\u2500 Derive skin type / concern options from DB subcategories (same as frontend filter) \u2500\u2500
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

  const dispatch = useDispatch();

  // ── Pre-populate form when modal opens ────────────────────────────────────
  useEffect(() => {
    if (!isOpen || !productData) return;

    // Extract category IDs (may be populated objects or raw IDs)
    const categoryIds = (productData.categories || [])
      .map(extractId)
      .filter(Boolean);
    const subcategoryIds = (productData.subcategories || [])
      .map(extractId)
      .filter(Boolean);

    // Ingredients: join array to comma string for editing
    const ingredientsRaw = Array.isArray(productData.ingredients)
      ? productData.ingredients.join(", ")
      : "";

    setFormData({
      name: productData.name || "",
      description: normalizeBilingual(productData.description),
      brandName: productData.brandName || "",
      productType: productData.productType || "",
      countryOfOrigin: productData.countryOfOrigin || "",
      masterCategory: extractId(productData.masterCategory) || "",
      categories: categoryIds,
      subcategories: subcategoryIds,
      howToUse: normalizeBilingual(productData.howToUse),
      addedBenefits: normalizeBilingual(productData.addedBenefits),
      visibleResults: normalizeBilingual(productData.visibleResults),
      primaryPurpose: normalizeBilingual(productData.primaryPurpose),
      antiAgingEffect: productData.antiAgingEffect || "",
      skinTypes: productData.skinTypes || [],
      skinConcerns: productData.skinConcerns || [],
      ingredientsRaw,
      thumbnails: [],
      video: null,
      YTVideoUrl: productData.YTVideoUrl || "",
    });
  }, [isOpen, productData]);

  // ── Filtered lists ────────────────────────────────────────────────────────
  const filteredCategories = categories.filter(
    (cat) => cat.masterCategory?._id === formData.masterCategory
  );

  const filteredSubcategories = subcategories.filter((sub) =>
    formData.categories.includes(sub.category?._id)
  );

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBilingualChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleMasterCategoryChange = (e) => {
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
      const validSubIds = subcategories
        .filter((sub) => newCategories.includes(sub.category?._id))
        .map((sub) => sub._id);
      return {
        ...prev,
        categories: newCategories,
        subcategories: prev.subcategories.filter((id) =>
          validSubIds.includes(id)
        ),
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

  // ── Submit ────────────────────────────────────────────────────────────────
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
    data.append("categories", JSON.stringify(formData.categories));
    data.append("subcategories", JSON.stringify(formData.subcategories));
    data.append("howToUse", JSON.stringify(formData.howToUse));
    data.append("addedBenefits", JSON.stringify(formData.addedBenefits));
    data.append("visibleResults", JSON.stringify(formData.visibleResults));
    data.append("primaryPurpose", JSON.stringify(formData.primaryPurpose));
    data.append("antiAgingEffect", formData.antiAgingEffect);
    data.append("YTVideoUrl", formData.YTVideoUrl);

    const ingredientsArray = formData.ingredientsRaw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    data.append("ingredients", JSON.stringify(ingredientsArray));
    data.append("skinTypes", JSON.stringify(formData.skinTypes));
    data.append("skinConcerns", JSON.stringify(formData.skinConcerns));

    formData.thumbnails.forEach((file) => data.append("thumbnails", file));
    if (formData.video) data.append("video", formData.video);

    try {
      const response = await updateProduct(productData._id, data);
      dispatch(updateProductData(response.data));
      toast.success(response?.message || "Product updated successfully.");
      onClose();
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to update product."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-black/30 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-[650px] max-w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Edit Product</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

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
            <input
              type="text"
              name="brandName"
              placeholder="Brand Name *"
              value={formData.brandName}
              onChange={handleChange}
              className="border p-2 rounded"
              required
            />
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

          {/* ── Bilingual Product Details ── */}
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

          {/* ── Subcategories (grouped by parent category) ── */}
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

          {/* ── Thumbnails ── */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Replace Thumbnails{" "}
              <span className="text-xs text-gray-400">(optional, max 2)</span>
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              className="border border-gray-300 px-3 py-2 rounded-md w-full"
            />
          </div>

          {/* ── Video ── */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Video{" "}
              <span className="text-xs text-gray-400">(Optional)</span>
            </label>
            {productData?.videoUrl && (
              <div className="mb-2 text-sm text-gray-600 bg-gray-100 p-2 rounded">
                Current:{" "}
                <a
                  href={productData.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  View Video
                </a>
              </div>
            )}
            <input
              type="file"
              accept="video/mp4,video/webm,video/quicktime"
              onChange={handleVideoChange}
              className="border border-gray-300 px-3 py-2 rounded-md w-full"
            />
            <p className="text-xs text-gray-500 mt-1">
              Upload new video to replace existing (MP4, WebM, MOV | Max 50MB)
            </p>
          </div>

          {/* ── YouTube URL ── */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              YouTube Video URL{" "}
              <span className="text-xs text-gray-400">
                (How to Use — Optional)
              </span>
            </label>
            {productData?.YTVideoUrl && (
              <div className="mb-2 text-sm text-gray-600 bg-gray-100 p-2 rounded truncate">
                Current:{" "}
                <a
                  href={productData.YTVideoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  {productData.YTVideoUrl}
                </a>
              </div>
            )}
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
              {loading ? <SvgSpinner /> : "Update Product"}
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

export default EditProductModal;
