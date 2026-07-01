import { useState, useEffect, useMemo } from "react";
import { FaEdit, FaTrash, FaSync, FaChevronDown } from "react-icons/fa";
import { useDispatch } from "react-redux";
import Modal from "../../common/Modal";
import { deleteVariantById, editVariantById, deleteVariantImageById } from "../../services/products";
import { deleteVariant, editVariant } from "../../store/slices/productSlice";
import { toast } from "react-toastify";
import SvgSpinner from "../../common/SvgSpinner";
import { syncVariantToZoho } from "../../services/zoho";

// ─── Helpers ────────────────────────────────────────────────────────────────

const resolveDecimal = (val) => String(val?.$numberDecimal ?? val ?? "");

const buildEditData = (variant) => ({
  price: resolveDecimal(variant.price),
  discountPrice: resolveDecimal(variant.discountPrice),
  stock: String(variant.stock ?? ""),
  sku: variant.sku ?? "",
  isActive: variant.isActive ?? true,
  images: [],
  existingImages: variant.images ?? [],
  imagesToRemove: [],
  imageAlts: variant.imageAlts && variant.imageAlts.length ? [...variant.imageAlts] : (variant.images || []).map(() => ""),
  newAlts: [],
  shade: variant.specs?.shade ?? "",
  size: variant.specs?.size ?? "",
  finish: variant.specs?.finish ?? "",
  skinType: variant.specs?.skinType ?? "",
  formulation: variant.specs?.formulation ?? "",
  spf: variant.specs?.spf ?? "",
  fragrance: variant.specs?.fragrance ?? "",
  packaging: variant.specs?.packaging ?? "",
  volume: variant.specs?.volume ?? "",
  weight: variant.specs?.weight ?? "",
  color: variant.specs?.color ?? "",
  material: variant.specs?.material ?? "",
  expiryDate: variant.specs?.expiryDate ? variant.specs.expiryDate.slice(0, 10) : "",
});

const buildSpecs = (d) => ({
  shade: d.shade,
  size: d.size,
  finish: d.finish,
  skinType: d.skinType,
  formulation: d.formulation,
  spf: d.spf,
  fragrance: d.fragrance,
  packaging: d.packaging,
  volume: d.volume,
  weight: d.weight,
  color: d.color,
  material: d.material,
  expiryDate: d.expiryDate,
});

const VARIANTS_PER_PAGE = 5;

// ─── Sub-components ──────────────────────────────────────────────────────────

const SpecTag = ({ value }) => {
  if (!value) return null;
  return (
    <span className="text-xs bg-secondary px-2 py-0.5 rounded text-dark shrink-0 font-medium">
      {value}
    </span>
  );
};

const VariantCardHeader = ({
  variant,
  isExpanded,
  isDirty,
  onToggle,
  onDelete,
  onSync,
}) => {
  const price = Number(resolveDecimal(variant.price)).toFixed(2);
  const stock = variant.stock ?? 0;
  const thumbnails = variant.images?.slice(0, 3) ?? [];
  const extraImages = (variant.images?.length ?? 0) - 3;

  const stockChipClass =
    stock === 0
      ? "bg-red-100 text-red-700 border border-red-200"
      : stock < 5
      ? "bg-yellow-100 text-yellow-700 border border-yellow-200"
      : "bg-gray-100 text-gray-600 border border-gray-200";

  return (
    <div
      className="flex items-center gap-3 px-4 py-3 bg-white cursor-pointer hover:bg-gray-50 transition-colors select-none"
      onClick={onToggle}
    >
      {/* Chevron */}
      <FaChevronDown
        size={12}
        className={`text-gray-400 shrink-0 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
      />

      {/* SKU */}
      {variant.sku && (
        <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded text-gray-600 shrink-0 hidden sm:inline">
          {variant.sku}
        </span>
      )}

      {/* Key spec tags — value only, no label prefix */}
      <div className="flex gap-1.5 flex-wrap flex-1 min-w-0">
        <SpecTag value={variant.specs?.size} />
        <SpecTag value={variant.specs?.color} />
        <SpecTag value={variant.specs?.shade} />
      </div>

      {/* Price — main price only; full pricing detail in expanded view */}
      <span className="text-sm font-semibold text-dark shrink-0 hidden sm:inline">
        ${price}
      </span>

      {/* Stock chip — color encodes level */}
      <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 hidden sm:inline ${stockChipClass}`}>
        {stock} in stock
      </span>

      {/* Active / Inactive badge */}
      <span
        className={`px-2 py-0.5 rounded-full text-xs font-semibold border shrink-0 hidden md:inline ${
          variant.isActive
            ? "bg-green-100 text-green-700 border-green-200"
            : "bg-red-100 text-red-700 border-red-200"
        }`}
      >
        {variant.isActive ? "Active" : "Inactive"}
      </span>

      {/* Dirty indicator */}
      {isDirty && (
        <span
          title="Unsaved changes"
          className="w-2 h-2 rounded-full bg-amber-400 shrink-0"
        />
      )}

      {/* Thumbnails */}
      {thumbnails.length > 0 && (
        <div className="hidden lg:flex gap-1 shrink-0">
          {thumbnails.map((img) => (
            <img
              key={img._id}
              src={img.url}
              alt="variant"
              className="w-7 h-7 rounded object-cover border border-gray-200"
            />
          ))}
          {extraImages > 0 && (
            <span className="text-xs text-gray-400 self-center">+{extraImages}</span>
          )}
        </div>
      )}

      {/* Actions */}
      <div
        className="flex gap-2 ml-auto shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          title="Delete variant"
          onClick={() => onDelete(variant)}
          className="text-gray-400 hover:text-red-600 cursor-pointer transition-colors"
        >
          <FaTrash size={14} />
        </button>
        <button
          title="Sync to Zoho"
          onClick={() => onSync(variant._id)}
          className="text-blue-400 hover:text-blue-600 cursor-pointer transition-colors"
        >
          <FaSync size={14} />
        </button>
      </div>
    </div>
  );
};

const VariantReadView = ({ variant, onEditClick }) => {
  const specFields = [
    ["Size", variant.specs?.size],
    ["Shade", variant.specs?.shade],
    ["Color", variant.specs?.color],
    ["Finish", variant.specs?.finish],
    ["Skin Type", variant.specs?.skinType],
    ["Formulation", variant.specs?.formulation],
    ["SPF", variant.specs?.spf],
    ["Fragrance", variant.specs?.fragrance],
    ["Packaging", variant.specs?.packaging],
    ["Volume", variant.specs?.volume],
    ["Weight", variant.specs?.weight],
    ["Material", variant.specs?.material],
    ["Expiry Date", variant.specs?.expiryDate ? variant.specs.expiryDate.slice(0, 10) : null],
  ].filter(([, v]) => v);

  return (
    <div className="space-y-4">
      {/* Core fields */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
        {[
          ["Price", `$${Number(resolveDecimal(variant.price)).toFixed(2)}`],
          ["Discount Price", `$${Number(resolveDecimal(variant.discountPrice)).toFixed(2)}`],
          ["Stock", variant.stock],
          ["SKU", variant.sku || "—"],
        ].map(([label, value]) => (
          <div key={label}>
            <p className="text-xs text-gray-400 uppercase tracking-wide">{label}</p>
            <p className="font-medium text-gray-800">{value}</p>
          </div>
        ))}
      </div>

      {/* Specs grid */}
      {specFields.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2 text-sm border-t border-gray-100 pt-3">
          {specFields.map(([label, value]) => (
            <div key={label}>
              <p className="text-xs text-gray-400 uppercase tracking-wide">{label}</p>
              <p className="font-medium text-gray-700">{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Images */}
      {variant.images?.length > 0 && (
        <div className="border-t border-gray-100 pt-3">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Images</p>
          <div className="flex gap-2 flex-wrap">
            {variant.images.map((img) => (
              <img
                key={img._id}
                src={img.url}
                alt="variant"
                className="w-14 h-14 rounded-lg object-cover border border-gray-200"
              />
            ))}
          </div>
        </div>
      )}

      {/* Edit button */}
      <div className="pt-1">
        <button
          type="button"
          onClick={onEditClick}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-dark bg-primary px-3 py-1.5 rounded hover:bg-primary/80 cursor-pointer transition-colors"
        >
          <FaEdit size={12} />
          Edit Variant
        </button>
      </div>
    </div>
  );
};

const EditSection = ({ title, children, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-gray-50 text-left hover:bg-gray-100 transition-colors"
      >
        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">{title}</span>
        <FaChevronDown
          size={11}
          className={`text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && <div className="px-4 pb-4 pt-3">{children}</div>}
    </div>
  );
};

const LabeledInput = ({ label, name, type = "text", value, onChange, required, className = "" }) => (
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
      className={`border border-gray-300 rounded p-2 w-full text-sm focus:outline-none focus:ring-1 focus:ring-primary ${className}`}
    />
  </div>
);

const VariantEditForm = ({
  variantId,
  editData,
  onFieldChange,
  onAddImages,
  onRemoveExistingImage,
  onRestoreExistingImage,
  onRemoveNewImage,
  onSubmit,
  onCancel,
  isLoading,
}) => {
  const onChange = (e) => onFieldChange(variantId, e);

  // Object URLs for new-file previews — revoked on cleanup
  const newPreviews = useMemo(
    () => (editData.images || []).map((f) => URL.createObjectURL(f)),
    [editData.images]
  );
  useEffect(() => () => newPreviews.forEach(URL.revokeObjectURL), [newPreviews]);

  const removedSet = new Set(editData.imagesToRemove || []);
  const hasImageChanges =
    removedSet.size > 0 || (editData.images || []).length > 0;

  return (
    <form onSubmit={(e) => onSubmit(e, variantId)} className="space-y-3 text-sm">
      {/* Core */}
      <EditSection title="Core Fields" defaultOpen>
        <div className="grid grid-cols-2 gap-3">
          <LabeledInput label="Price" name="price" type="number" value={editData.price} onChange={onChange} required />
          <LabeledInput label="Discount Price" name="discountPrice" type="number" value={editData.discountPrice} onChange={onChange} />
          <LabeledInput label="Stock" name="stock" type="number" value={editData.stock} onChange={onChange} required />
          <LabeledInput label="SKU" name="sku" value={editData.sku} onChange={onChange} />
        </div>
      </EditSection>

      {/* Beauty Specs */}
      <EditSection title="Beauty Specs">
        <div className="grid grid-cols-2 gap-3">
          <LabeledInput label="Shade" name="shade" value={editData.shade} onChange={onChange} />
          <LabeledInput label="Size" name="size" value={editData.size} onChange={onChange} />
          <LabeledInput label="Color" name="color" value={editData.color} onChange={onChange} />
          <LabeledInput label="Finish" name="finish" value={editData.finish} onChange={onChange} />
          <LabeledInput label="Fragrance" name="fragrance" value={editData.fragrance} onChange={onChange} />
          <LabeledInput label="Skin Type" name="skinType" value={editData.skinType} onChange={onChange} />
        </div>
      </EditSection>

      {/* Technical Specs */}
      <EditSection title="Technical Specs">
        <div className="grid grid-cols-2 gap-3">
          <LabeledInput label="Formulation" name="formulation" value={editData.formulation} onChange={onChange} />
          <LabeledInput label="SPF" name="spf" value={editData.spf} onChange={onChange} />
          <LabeledInput label="Volume" name="volume" value={editData.volume} onChange={onChange} />
          <LabeledInput label="Weight" name="weight" value={editData.weight} onChange={onChange} />
          <LabeledInput label="Packaging" name="packaging" value={editData.packaging} onChange={onChange} />
          <LabeledInput label="Material" name="material" value={editData.material} onChange={onChange} />
        </div>
      </EditSection>

      {/* Lifecycle & Status */}
      <EditSection title="Lifecycle & Status">
        <div className="space-y-3">
          <div className="flex flex-col gap-0.5">
            <label className="text-xs text-gray-500 block">Expiry Date</label>
            <input
              type="date"
              name="expiryDate"
              value={editData.expiryDate}
              onChange={onChange}
              className="border border-gray-300 rounded p-2 w-full text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="isActive"
              checked={editData.isActive}
              onChange={(e) =>
                onFieldChange(variantId, {
                  target: { name: "isActive", type: "checkbox", checked: e.target.checked },
                })
              }
              className="h-4 w-4 cursor-pointer"
            />
            <span className="text-sm text-gray-700">Active</span>
          </label>
        </div>
      </EditSection>

      {/* Media */}
      <EditSection title="Images" defaultOpen>
        <div className="space-y-4">
          {/* Existing images */}
          {editData.existingImages?.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 font-medium mb-2">Current Images</p>
              <div className="flex gap-2 flex-wrap">
                {editData.existingImages.map((img) => {
                  const markedForRemoval = removedSet.has(img._id);
                  return (
                    <div key={img._id} className="relative group">
                      <img
                        src={img.url}
                        alt="variant"
                        className={`w-16 h-16 rounded-lg object-cover border transition-opacity ${
                          markedForRemoval
                            ? "opacity-30 border-red-300"
                            : "border-gray-200"
                        }`}
                      />
                      {markedForRemoval ? (
                        <button
                          type="button"
                          title="Undo removal"
                          onClick={() => onRestoreExistingImage(variantId, img._id)}
                          className="absolute inset-0 flex items-center justify-center rounded-lg bg-red-50/60 text-red-500 text-[10px] font-semibold"
                        >
                          Undo
                        </button>
                      ) : (
                        <button
                          type="button"
                          title="Remove image"
                          onClick={() => onRemoveExistingImage(variantId, img._id)}
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity leading-none"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
              {removedSet.size > 0 && (
                <p className="text-xs text-red-500 mt-1.5">
                  {removedSet.size} image{removedSet.size !== 1 ? "s" : ""} will be deleted on save
                </p>
              )}
            </div>
          )}

          {/* New image previews */}
          {newPreviews.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 font-medium mb-2">
                New Images to Add ({newPreviews.length})
              </p>
              <div className="flex gap-2 flex-wrap">
                {newPreviews.map((src, idx) => (
                  <div key={idx} className="relative group">
                    <img
                      src={src}
                      alt="new upload"
                      className="w-16 h-16 rounded-lg object-cover border-2 border-dashed border-primary/60"
                    />
                    <button
                      type="button"
                      title="Remove"
                      onClick={() => onRemoveNewImage(variantId, idx)}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity leading-none"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* File picker — appends to selection */}
          <div>
            <p className="text-xs text-gray-400 mb-1.5">
              {hasImageChanges ? "Add more images" : "Add images"}
            </p>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => onAddImages(variantId, e)}
              className="border border-gray-300 rounded p-2 w-full text-sm cursor-pointer"
            />
          </div>

          {/* Alt Texts */}
          {editData.existingImages?.length > 0 && (
            <div className="space-y-2 mt-2">
              <p className="text-xs text-gray-500 font-semibold">Existing Images Alt Texts</p>
              {editData.existingImages.map((img, idx) => {
                const markedForRemoval = removedSet.has(img._id);
                if (markedForRemoval) return null;
                return (
                  <div key={img._id} className="flex flex-col gap-0.5">
                    <label className="text-[10px] text-gray-500 font-semibold">
                      Image {idx + 1} Alt Text
                    </label>
                    <input
                      type="text"
                      placeholder={`Alt text for image ${idx + 1}`}
                      value={editData.imageAlts?.[idx] || ""}
                      onChange={(e) => {
                        const newAlts = [...(editData.imageAlts || [])];
                        newAlts[idx] = e.target.value;
                        onFieldChange(variantId, {
                          target: { name: "imageAlts", value: newAlts }
                        });
                      }}
                      className="border border-gray-300 rounded p-1.5 w-full text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                );
              })}
            </div>
          )}

          {newPreviews.length > 0 && (
            <div className="space-y-2 mt-2">
              <p className="text-xs text-gray-500 font-semibold">New Images Alt Texts</p>
              {newPreviews.map((src, idx) => (
                <div key={idx} className="flex flex-col gap-0.5">
                  <label className="text-[10px] text-gray-500 font-semibold">
                    New Image {idx + 1} Alt Text
                  </label>
                  <input
                    type="text"
                    placeholder={`Alt text for new image ${idx + 1}`}
                    value={editData.newAlts?.[idx] || ""}
                    onChange={(e) => {
                      const newAlts = [...(editData.newAlts || [])];
                      newAlts[idx] = e.target.value;
                      onFieldChange(variantId, {
                        target: { name: "newAlts", value: newAlts }
                      });
                    }}
                    className="border border-gray-300 rounded p-1.5 w-full text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </EditSection>

      {/* Actions */}
      <div className="flex gap-3 pt-1">
        <button
          type="submit"
          disabled={isLoading}
          className="bg-primary text-dark px-4 py-2 rounded flex-1 cursor-pointer hover:bg-primary/80 disabled:opacity-50 transition-colors font-medium text-sm"
        >
          {isLoading ? <SvgSpinner /> : "Save Changes"}
        </button>
        <button
          type="button"
          onClick={() => onCancel(variantId)}
          className="bg-gray-200 text-gray-700 px-4 py-2 rounded flex-1 cursor-pointer hover:bg-gray-300 transition-colors text-sm"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

const PaginationBar = ({ currentPage, totalPages, onPageChange }) => (
  <div className="flex justify-center items-center gap-1 pt-4 border-t border-gray-100 mt-2">
    <button
      disabled={currentPage === 1}
      onClick={() => onPageChange(currentPage - 1)}
      className="px-3 py-1 rounded text-sm hover:bg-gray-200 disabled:opacity-40 transition-colors"
    >
      &lt;
    </button>
    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
      <button
        key={p}
        onClick={() => onPageChange(p)}
        className={`px-3 py-1 rounded-full text-sm min-w-8 transition-colors ${
          p === currentPage
            ? "bg-primary text-dark font-medium"
            : "text-gray-600 hover:bg-gray-200"
        }`}
      >
        {p}
      </button>
    ))}
    <button
      disabled={currentPage === totalPages}
      onClick={() => onPageChange(currentPage + 1)}
      className="px-3 py-1 rounded text-sm hover:bg-gray-200 disabled:opacity-40 transition-colors"
    >
      &gt;
    </button>
  </div>
);

// ─── Main Component ──────────────────────────────────────────────────────────

function VariantListModal({ isOpen, onClose, variants }) {
  const dispatch = useDispatch();

  const [expandedId, setExpandedId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editDataMap, setEditDataMap] = useState({});
  const [dirtyMap, setDirtyMap] = useState({});
  const [loadingMap, setLoadingMap] = useState({});
  const [currentPage, setCurrentPage] = useState(1);

  // Reset all state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setExpandedId(null);
      setEditingId(null);
      setEditDataMap({});
      setDirtyMap({});
      setLoadingMap({});
      setCurrentPage(1);
    }
  }, [isOpen]);

  const totalPages = Math.ceil((variants?.length ?? 0) / VARIANTS_PER_PAGE);
  const pagedVariants = (variants ?? []).slice(
    (currentPage - 1) * VARIANTS_PER_PAGE,
    currentPage * VARIANTS_PER_PAGE
  );

  // ── Handlers ──────────────────────────────────────────────────────────────

  const guardDirty = (id) => {
    if (id && dirtyMap[id]) {
      if (!window.confirm("You have unsaved changes. Continue anyway?")) return false;
      setEditDataMap((p) => { const n = { ...p }; delete n[id]; return n; });
      setDirtyMap((p) => { const n = { ...p }; delete n[id]; return n; });
      setEditingId(null);
    }
    return true;
  };

  const handleToggleExpand = (variantId) => {
    if (expandedId === variantId) {
      if (!guardDirty(editingId === variantId ? variantId : null)) return;
      setEditingId(null);
      setExpandedId(null);
    } else {
      if (!guardDirty(editingId)) return;
      setEditingId(null);
      setExpandedId(variantId);
    }
  };

  const handleEnterEdit = (variant) => {
    if (!editDataMap[variant._id]) {
      setEditDataMap((p) => ({ ...p, [variant._id]: buildEditData(variant) }));
    }
    setEditingId(variant._id);
  };

  const handleFieldChange = (variantId, e) => {
    const { name, value, type, checked } = e.target;
    setEditDataMap((p) => ({
      ...p,
      [variantId]: { ...p[variantId], [name]: type === "checkbox" ? checked : value },
    }));
    setDirtyMap((p) => ({ ...p, [variantId]: true }));
  };

  // Append newly chosen files to the current selection (not replace)
  const handleAddImages = (variantId, e) => {
    const incoming = Array.from(e.target.files);
    setEditDataMap((p) => {
      const data = p[variantId];
      const newImages = [...(data.images || []), ...incoming];
      const newAlts = [...(data.newAlts || [])];
      incoming.forEach(() => newAlts.push(""));
      return {
        ...p,
        [variantId]: { ...data, images: newImages, newAlts },
      };
    });
    setDirtyMap((p) => ({ ...p, [variantId]: true }));
    e.target.value = ""; // reset so same file can be picked again
  };

  const handleRemoveExistingImage = (variantId, imageId) => {
    setEditDataMap((p) => ({
      ...p,
      [variantId]: {
        ...p[variantId],
        imagesToRemove: [...(p[variantId].imagesToRemove || []), imageId],
      },
    }));
    setDirtyMap((p) => ({ ...p, [variantId]: true }));
  };

  const handleRestoreExistingImage = (variantId, imageId) => {
    setEditDataMap((p) => ({
      ...p,
      [variantId]: {
        ...p[variantId],
        imagesToRemove: (p[variantId].imagesToRemove || []).filter(
          (id) => id !== imageId
        ),
      },
    }));
  };

  const handleRemoveNewImage = (variantId, index) => {
    setEditDataMap((p) => {
      const files = [...(p[variantId].images || [])];
      files.splice(index, 1);
      const newAlts = [...(p[variantId].newAlts || [])];
      newAlts.splice(index, 1);
      return { ...p, [variantId]: { ...p[variantId], images: files, newAlts } };
    });
    setDirtyMap((p) => ({ ...p, [variantId]: true }));
  };

  const handleCancelEdit = (variantId) => {
    setEditDataMap((p) => { const n = { ...p }; delete n[variantId]; return n; });
    setDirtyMap((p) => { const n = { ...p }; delete n[variantId]; return n; });
    setEditingId(null);
  };

  const handleEditSubmit = async (e, variantId) => {
    e.preventDefault();
    const d = editDataMap[variantId];
    setLoadingMap((p) => ({ ...p, [variantId]: true }));
    try {
      // Step 1: delete individually removed images
      if (d.imagesToRemove?.length > 0) {
        await Promise.all(
          d.imagesToRemove.map((imageId) =>
            deleteVariantImageById(variantId, imageId)
          )
        );
      }

      // Step 2: PUT other fields + new images (backend appends, does not replace)
      const formData = new FormData();
      formData.append("price", d.price);
      formData.append("discountPrice", d.discountPrice || "");
      formData.append("stock", d.stock);
      formData.append("sku", d.sku);
      formData.append("isActive", d.isActive);
      formData.append("specs", JSON.stringify(buildSpecs(d)));

      if (Array.isArray(d.images) && d.images.length > 0) {
        d.images.forEach((file) => formData.append("images", file));
      }

      const remainingAlts = (d.existingImages || [])
        .map((img, idx) => ({ id: img._id, alt: d.imageAlts?.[idx] || "" }))
        .filter((img) => !(d.imagesToRemove || []).includes(img.id))
        .map((img) => img.alt);
      const newAlts = d.newAlts || [];
      const finalAlts = [...remainingAlts, ...newAlts];
      formData.append("imageAlts", JSON.stringify(finalAlts));

      const response = await editVariantById(variantId, formData);
      dispatch(editVariant(response.data));
      toast.success(response?.message || "Variant updated successfully!");

      setEditDataMap((p) => { const n = { ...p }; delete n[variantId]; return n; });
      setDirtyMap((p) => { const n = { ...p }; delete n[variantId]; return n; });
      setEditingId(null);
      setExpandedId(null);
      onClose();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Update failed");
      console.error("Error updating variant:", error);
    } finally {
      setLoadingMap((p) => ({ ...p, [variantId]: false }));
    }
  };

  const handleDelete = async (variant) => {
    if (window.confirm("Are you sure you want to delete this variant?")) {
      try {
        const response = await deleteVariantById(variant._id);
        dispatch(deleteVariant({ productId: variant.productId, id: variant._id }));
        toast.success(response?.message || "Variant deleted successfully!");
        onClose();
      } catch (error) {
        toast.error(error?.response?.data?.message || "Delete failed");
        console.error("Error deleting variant:", error);
      }
    }
  };

  const handleSync = async (variantId) => {
    try {
      const res = await syncVariantToZoho(variantId);
      toast.success(res?.message || "Item synced to Zoho successfully!");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Sync failed");
      console.error("Error syncing item:", error);
    }
  };

  const handlePageChange = (newPage) => {
    if (!guardDirty(editingId)) return;
    setExpandedId(null);
    setEditingId(null);
    setCurrentPage(newPage);
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Product Variants" maxWidth="max-w-4xl">
      {!variants?.length ? (
        <p className="text-gray-500 text-sm py-4">No variants available for this product.</p>
      ) : (
        <div>
          {/* Variant count */}
          <p className="text-xs text-gray-400 mb-3">
            {variants.length} variant{variants.length !== 1 ? "s" : ""}
            {totalPages > 1 && ` · Page ${currentPage} of ${totalPages}`}
          </p>

          {/* Cards */}
          <div>
            {pagedVariants.map((variant) => {
              const isExpanded = expandedId === variant._id;
              const isEditing = editingId === variant._id;
              const isDirty = !!dirtyMap[variant._id];
              const isLoading = !!loadingMap[variant._id];

              return (
                <div
                  key={variant._id}
                  className={`border border-gray-200 rounded-lg overflow-hidden mb-3 last:mb-0 hover:shadow-sm transition-shadow ${
                    isEditing ? "border-l-4 border-l-primary" : ""
                  }`}
                >
                  <VariantCardHeader
                    variant={variant}
                    isExpanded={isExpanded}
                    isDirty={isDirty}
                    onToggle={() => handleToggleExpand(variant._id)}
                    onDelete={handleDelete}
                    onSync={handleSync}
                  />

                  {isExpanded && (
                    <div className="border-t border-gray-100 bg-gray-50 px-4 py-4">
                      {isEditing ? (
                        <VariantEditForm
                          variantId={variant._id}
                          editData={editDataMap[variant._id]}
                          onFieldChange={handleFieldChange}
                          onAddImages={handleAddImages}
                          onRemoveExistingImage={handleRemoveExistingImage}
                          onRestoreExistingImage={handleRestoreExistingImage}
                          onRemoveNewImage={handleRemoveNewImage}
                          onSubmit={handleEditSubmit}
                          onCancel={handleCancelEdit}
                          isLoading={isLoading}
                        />
                      ) : (
                        <VariantReadView
                          variant={variant}
                          onEditClick={() => handleEnterEdit(variant)}
                        />
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <PaginationBar
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      )}
    </Modal>
  );
}

export default VariantListModal;
