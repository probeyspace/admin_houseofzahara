import { useEffect, useMemo, useState } from "react";
import { FaChevronDown } from "react-icons/fa";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { updateProduct } from "../../services/products";
import SvgSpinner from "../../common/SvgSpinner";
import { updateProductData } from "../../store/slices/productSlice";

// ── Helpers ──────────────────────────────────────────────────────────────────
const toggleArrayItem = (arr, item) =>
  arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item];

const extractId = (val) => {
  if (!val) return null;
  if (typeof val === "string") return val;
  if (typeof val === "object" && val._id) return val._id;
  return null;
};

const normalizeBilingual = (val) => {
  if (!val) return { en: "", ar: "" };
  if (typeof val === "object" && !Array.isArray(val))
    return { en: val.en || "", ar: val.ar || "" };
  if (typeof val === "string") {
    try {
      const parsed = JSON.parse(val);
      if (parsed && typeof parsed === "object")
        return { en: parsed.en || "", ar: parsed.ar || "" };
    } catch (e) {
      void e;
    }
    return { en: val, ar: "" };
  }
  return { en: "", ar: "" };
};

// ── Shared UI primitives ──────────────────────────────────────────────────────
const SectionHeader = ({ title, isOpen, onToggle, note }) => (
  <button
    type="button"
    onClick={onToggle}
    className="w-full flex items-center justify-between py-2.5 px-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left rounded-t-lg"
  >
    <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide flex items-center gap-2">
      {title}
      {note && (
        <span className="px-1.5 py-0.5 rounded-full bg-red-100 text-red-600 text-[10px] font-bold normal-case">
          {note}
        </span>
      )}
    </span>
    <FaChevronDown
      size={11}
      className={`text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
    />
  </button>
);

const Section = ({ title, sectionKey, openSections, toggle, note, children }) => (
  <div className="border border-gray-200 rounded-lg overflow-hidden">
    <SectionHeader
      title={title}
      isOpen={openSections[sectionKey]}
      onToggle={() => toggle(sectionKey)}
      note={note}
    />
    {openSections[sectionKey] && (
      <div className="px-4 pb-4 pt-3">{children}</div>
    )}
  </div>
);

const LabeledInput = ({ label, name, type = "text", value, onChange, required, placeholder, colSpan = 1 }) => (
  <div className={colSpan === 2 ? "col-span-2" : ""}>
    <label className="block text-xs text-gray-500 mb-0.5">
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

const BilingualTextarea = ({ label, fieldKey, value, onChange, lang, rows = 3 }) => (
  <div>
    <label className="block text-xs text-gray-500 mb-0.5">{label}</label>
    <textarea
      value={value?.[lang] || ""}
      onChange={(e) => onChange(fieldKey, { ...value, [lang]: e.target.value })}
      placeholder={`${label} in ${lang === "en" ? "English" : "Arabic"}`}
      className="w-full border border-gray-300 p-2 rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary"
      rows={rows}
      dir={lang === "ar" ? "rtl" : "ltr"}
    />
  </div>
);

const PillToggle = ({ label, isSelected, onClick, color = "blue" }) => {
  const active =
    color === "green"
      ? "bg-green-100 border-green-400 text-green-700 font-medium"
      : "bg-blue-100 border-blue-400 text-blue-700 font-medium";
  return (
    <label
      className={`flex items-center gap-1 px-3 py-1.5 rounded-full border text-sm cursor-pointer transition-colors ${
        isSelected ? active : "border-gray-300 text-gray-600 hover:border-gray-400"
      }`}
      onClick={onClick}
    >
      {label}
    </label>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
const EditProductModal = ({ isOpen, onClose, productData }) => {
  const [activeLanguage, setActiveLanguage] = useState("en");
  const [loading, setLoading] = useState(false);
  const [thumbnailPreviews, setThumbnailPreviews] = useState([]);

  const [openSections, setOpenSections] = useState({
    basicInfo: true,
    description: true,
    productDetails: false,
    composition: false,
    classification: true,
    media: false,
  });
  const toggleSection = (key) =>
    setOpenSections((p) => ({ ...p, [key]: !p[key] }));

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
        ? subcategories?.filter((s) => s.category?._id === skinTypeCategory._id).map((s) => s.name) ?? []
        : [],
    [skinTypeCategory, subcategories]
  );
  const SKIN_CONCERN_OPTIONS = useMemo(
    () =>
      skinConcernCategory
        ? subcategories?.filter((s) => s.category?._id === skinConcernCategory._id).map((s) => s.name) ?? []
        : [],
    [skinConcernCategory, subcategories]
  );

  const dispatch = useDispatch();

  // ── Pre-populate on open ──────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen || !productData) return;
    const categoryIds = (productData.categories || []).map(extractId).filter(Boolean);
    const subcategoryIds = (productData.subcategories || []).map(extractId).filter(Boolean);
    const ingredientsRaw = Array.isArray(productData.ingredients)
      ? productData.ingredients.join(", ")
      : "";

    // Reset accordion to defaults each time a (potentially different) product opens
    setOpenSections({
      basicInfo: true,
      description: true,
      productDetails: false,
      composition: false,
      classification: true,
      media: false,
    });

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
    setThumbnailPreviews([]);
  }, [isOpen, productData]);

  // ── Filtered category lists ───────────────────────────────────────────────
  const filteredCategories = categories.filter(
    (cat) => cat.masterCategory?._id === formData.masterCategory
  );
  const filteredSubcategories = subcategories.filter((sub) =>
    formData.categories.includes(sub.category?._id)
  );

  // ── Handlers ─────────────────────────────────────────────────────────────
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
        subcategories: prev.subcategories.filter((id) => validSubIds.includes(id)),
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
    setThumbnailPreviews(files.map((f) => URL.createObjectURL(f)));
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
      setOpenSections((p) => ({ ...p, classification: true }));
      return;
    }
    if (formData.subcategories.length === 0) {
      toast.error("Please select at least one subcategory.");
      setOpenSections((p) => ({ ...p, classification: true }));
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
      toast.error(error?.response?.data?.message || "Failed to update product.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const existingThumbnails = productData?.thumbnailImages || [];
  const lang = activeLanguage;

  return (
    <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-black/40 z-50">
      <div className="bg-white w-full max-w-5xl rounded-xl shadow-xl flex flex-col max-h-[92vh]">

        {/* ── Fixed Header ── */}
        <div className="px-6 pt-5 pb-4 border-b border-gray-100 flex items-start justify-between shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Edit Product</h2>
            {productData?.name && (
              <p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">{productData.name}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none cursor-pointer mt-0.5"
          >
            &times;
          </button>
        </div>

        {/* ── Scrollable Body ── */}
        <div className="overflow-y-auto flex-1">

          {/* Sticky language tabs */}
          <div className="sticky top-0 bg-white z-10 px-6 pt-3 pb-0 border-b border-gray-100">
            <div className="flex gap-1">
              {[
                { key: "en", label: "English" },
                { key: "ar", label: "Arabic" },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveLanguage(key)}
                  className={`px-4 py-2 text-sm font-medium transition-colors cursor-pointer border-b-2 ${
                    activeLanguage === key
                      ? "border-primary text-dark"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <form id="edit-product-form" onSubmit={handleSubmit} className="px-6 py-4 space-y-3">

            {/* ── § Basic Info ── */}
            <Section title="Basic Info" sectionKey="basicInfo" openSections={openSections} toggle={toggleSection} note="required">
              <div className="grid grid-cols-2 gap-3">
                <LabeledInput label="Product Name" name="name" value={formData.name} onChange={handleChange} required colSpan={2} />
                <LabeledInput label="Brand Name" name="brandName" value={formData.brandName} onChange={handleChange} required />
                <LabeledInput label="Product Type" name="productType" value={formData.productType} onChange={handleChange} placeholder="e.g. Serum, Moisturiser" />
                <LabeledInput label="Country of Origin" name="countryOfOrigin" value={formData.countryOfOrigin} onChange={handleChange} placeholder="e.g. Italy" colSpan={2} />
              </div>
            </Section>

            {/* ── § Description ── */}
            <Section title="Description" sectionKey="description" openSections={openSections} toggle={toggleSection}>
              <BilingualTextarea
                label={`Description (${lang === "en" ? "English" : "Arabic"})`}
                fieldKey="description"
                value={formData.description}
                onChange={handleBilingualChange}
                lang={lang}
                rows={4}
              />
            </Section>

            {/* ── § Product Details ── */}
            <Section title="Product Details" sectionKey="productDetails" openSections={openSections} toggle={toggleSection}>
              <div className="space-y-3">
                <BilingualTextarea label={`How to Use (${lang === "en" ? "English" : "Arabic"})`} fieldKey="howToUse" value={formData.howToUse} onChange={handleBilingualChange} lang={lang} rows={2} />
                <BilingualTextarea label={`Added Benefits (${lang === "en" ? "English" : "Arabic"})`} fieldKey="addedBenefits" value={formData.addedBenefits} onChange={handleBilingualChange} lang={lang} rows={2} />
                <BilingualTextarea label={`Visible Results (${lang === "en" ? "English" : "Arabic"})`} fieldKey="visibleResults" value={formData.visibleResults} onChange={handleBilingualChange} lang={lang} rows={2} />
                <BilingualTextarea label={`Primary Purpose (${lang === "en" ? "English" : "Arabic"})`} fieldKey="primaryPurpose" value={formData.primaryPurpose} onChange={handleBilingualChange} lang={lang} rows={2} />
              </div>
            </Section>

            {/* ── § Composition ── */}
            <Section title="Composition & Skin Profile" sectionKey="composition" openSections={openSections} toggle={toggleSection}>
              <div className="space-y-4">
                {/* Ingredients */}
                <div>
                  <label className="block text-xs text-gray-500 mb-0.5">
                    Ingredients <span className="text-gray-400">(comma-separated)</span>
                  </label>
                  <textarea
                    name="ingredientsRaw"
                    placeholder="AQUA, GLYCERIN, TOCOPHEROL, CITRUS SINENSIS PEEL EXTRACT..."
                    value={formData.ingredientsRaw}
                    onChange={handleChange}
                    className="w-full border border-gray-300 p-2 rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    rows={3}
                  />
                </div>

                {/* Anti-aging */}
                <LabeledInput
                  label="Anti-Aging Effect"
                  name="antiAgingEffect"
                  value={formData.antiAgingEffect}
                  onChange={handleChange}
                  placeholder="e.g. Anti Aging Effect"
                />

                {/* Skin Types */}
                {SKIN_TYPE_OPTIONS.length > 0 && (
                  <div>
                    <label className="block text-xs text-gray-500 mb-1.5">Skin Types</label>
                    <div className="flex flex-wrap gap-2">
                      {SKIN_TYPE_OPTIONS.map((opt) => (
                        <PillToggle
                          key={opt}
                          label={opt}
                          isSelected={formData.skinTypes.includes(opt)}
                          onClick={() =>
                            setFormData((p) => ({
                              ...p,
                              skinTypes: toggleArrayItem(p.skinTypes, opt),
                            }))
                          }
                          color="blue"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Skin Concerns */}
                {SKIN_CONCERN_OPTIONS.length > 0 && (
                  <div>
                    <label className="block text-xs text-gray-500 mb-1.5">Skin Concerns</label>
                    <div className="flex flex-wrap gap-2">
                      {SKIN_CONCERN_OPTIONS.map((opt) => (
                        <PillToggle
                          key={opt}
                          label={opt}
                          isSelected={formData.skinConcerns.includes(opt)}
                          onClick={() =>
                            setFormData((p) => ({
                              ...p,
                              skinConcerns: toggleArrayItem(p.skinConcerns, opt),
                            }))
                          }
                          color="green"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Section>

            {/* ── § Classification ── */}
            <Section title="Classification" sectionKey="classification" openSections={openSections} toggle={toggleSection} note="required">
              <div className="space-y-4">
                {/* Master Category */}
                <div>
                  <label className="block text-xs text-gray-500 mb-0.5">
                    Master Category <span className="text-red-400">*</span>
                  </label>
                  <select
                    name="masterCategory"
                    value={formData.masterCategory}
                    onChange={handleMasterCategoryChange}
                    className="w-full border border-gray-300 p-2 rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    required
                  >
                    <option value="">Select Master Category</option>
                    {masterCategories.map((cat) => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                {/* Categories */}
                {formData.masterCategory && (
                  <div>
                    <label className="block text-xs text-gray-500 mb-1.5">
                      Categories <span className="text-red-400">*</span>
                      <span className="text-gray-400 ml-1">(select all that apply)</span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {filteredCategories.map((cat) => (
                        <PillToggle
                          key={cat._id}
                          label={cat.name}
                          isSelected={formData.categories.includes(cat._id)}
                          onClick={() => toggleCategory(cat._id)}
                          color="blue"
                        />
                      ))}
                      {filteredCategories.length === 0 && (
                        <p className="text-xs text-gray-400">No categories found for this master category.</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Subcategories */}
                {formData.categories.length > 0 && (
                  <div>
                    <label className="block text-xs text-gray-500 mb-1.5">
                      Subcategories <span className="text-red-400">*</span>
                      <span className="text-gray-400 ml-1">(select all that apply)</span>
                    </label>
                    {formData.categories.map((catId) => {
                      const cat = categories.find((c) => c._id === catId);
                      const catSubs = filteredSubcategories.filter(
                        (sub) => sub.category?._id === catId
                      );
                      if (!catSubs.length) return null;
                      return (
                        <div key={catId} className="mb-3">
                          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
                            {cat?.name}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {catSubs.map((sub) => (
                              <PillToggle
                                key={sub._id}
                                label={sub.name}
                                isSelected={formData.subcategories.includes(sub._id)}
                                onClick={() => toggleSubcategory(sub._id)}
                                color="green"
                              />
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </Section>

            {/* ── § Media ── */}
            <Section title="Media" sectionKey="media" openSections={openSections} toggle={toggleSection}>
              <div className="space-y-5">

                {/* Thumbnails */}
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">
                    Thumbnail Images <span className="text-gray-400">(max 2)</span>
                  </label>

                  {/* Current thumbnails preview */}
                  {existingThumbnails.length > 0 && thumbnailPreviews.length === 0 && (
                    <div className="mb-3">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1.5">Current</p>
                      <div className="flex gap-2">
                        {existingThumbnails.map((img) => (
                          <img
                            key={img._id || img.url}
                            src={img.url}
                            alt="thumbnail"
                            className="w-20 h-20 rounded-lg object-cover border border-gray-200"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* New thumbnail previews */}
                  {thumbnailPreviews.length > 0 && (
                    <div className="mb-3">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1.5">
                        New (will replace current)
                      </p>
                      <div className="flex gap-2">
                        {thumbnailPreviews.map((src, i) => (
                          <img
                            key={i}
                            src={src}
                            alt="new thumbnail"
                            className="w-20 h-20 rounded-lg object-cover border-2 border-dashed border-primary/60"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                    className="border border-gray-300 rounded p-2 w-full text-sm cursor-pointer"
                  />
                </div>

                {/* Video */}
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">
                    Product Video <span className="text-gray-400">(optional, max 50MB)</span>
                  </label>
                  {productData?.videoUrl && (
                    <div className="mb-2 text-xs text-gray-600 bg-gray-50 px-3 py-2 rounded border border-gray-100 flex items-center justify-between">
                      <span className="text-gray-400">Current video</span>
                      <a
                        href={productData.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline font-medium"
                      >
                        View →
                      </a>
                    </div>
                  )}
                  {formData.video && (
                    <p className="text-xs text-green-600 mb-1.5">
                      ✓ New video selected: {formData.video.name}
                    </p>
                  )}
                  <input
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime"
                    onChange={handleVideoChange}
                    className="border border-gray-300 rounded p-2 w-full text-sm cursor-pointer"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">
                    Upload new video to replace existing · MP4, WebM, MOV
                  </p>
                </div>

                {/* YouTube URL */}
                <div>
                  <label className="block text-xs text-gray-500 mb-0.5">
                    YouTube Video URL <span className="text-gray-400">(optional)</span>
                  </label>
                  {productData?.YTVideoUrl && (
                    <div className="mb-2 text-xs text-gray-600 bg-gray-50 px-3 py-2 rounded border border-gray-100 flex items-center justify-between">
                      <span className="text-gray-400 truncate max-w-[200px]">{productData.YTVideoUrl}</span>
                      <a
                        href={productData.YTVideoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline font-medium shrink-0 ml-2"
                      >
                        View →
                      </a>
                    </div>
                  )}
                  <input
                    type="url"
                    name="YTVideoUrl"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={formData.YTVideoUrl}
                    onChange={handleChange}
                    className="w-full border border-gray-300 p-2 rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
            </Section>

          </form>
        </div>

        {/* ── Fixed Footer ── */}
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
            form="edit-product-form"
            disabled={loading}
            className="bg-primary text-dark px-4 py-2 rounded hover:bg-primary/80 cursor-pointer flex-1 text-sm font-medium disabled:opacity-50 transition-colors"
          >
            {loading ? <SvgSpinner /> : "Update Product"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProductModal;
