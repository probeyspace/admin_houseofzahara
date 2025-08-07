import { useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import { useDispatch } from "react-redux";
import Modal from "../../common/Modal";
import { deleteVariantById, editVariantById } from "../../services/products";
import { deleteVariant, editVariant } from "../../store/slices/productSlice";
import { toast } from "react-toastify";
import SvgSpinner from "../../common/SvgSpinner";

function VariantListModal({ isOpen, onClose, variants }) {
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [editData, setEditData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();

  const handleDelete = async (variant) => {
    if (window.confirm("Are you sure you want to delete this variant?")) {
      try {
        const response = await deleteVariantById(variant._id);
        dispatch(
          deleteVariant({ productId: variant.productId, id: variant._id })
        );
        toast.success(response?.message || "Variant deleted successfully!");
        onClose();
      } catch (error) {
        toast.error(error?.response?.data?.message || "Delete failed");
        console.error("Error deleting variant:", error);
      }
    }
  };

  const handleEdit = (variant) => {
    const cleanedVariant = {
      ...variant,
      price: variant.price?.$numberDecimal || variant.price,
      discountPrice:
        variant.discountPrice?.$numberDecimal || variant.discountPrice,
      stock: variant.stock,
      sku: variant.sku,
      isActive: variant.isActive ?? true,
      images: [], // Let user optionally reupload images
      attributes: variant.attributes || [],
      ...variant.specs, // Flatten specs like shade, size, etc.
    };

    // Convert attributes array to key-value map for input prefill
    const attributesObj = {};
    if (cleanedVariant.attributes?.length > 0) {
      cleanedVariant.attributes.forEach((attr) => {
        if (attr.key && attr.value) {
          attributesObj[attr.key] = attr.value;
        }
      });
    }

    cleanedVariant.attributesObj = attributesObj;

    setSelectedVariant(variant);
    setEditData(cleanedVariant);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const formData = new FormData();

      // specs object
      const specs = {
        shade: editData.shade,
        size: editData.size,
        finish: editData.finish,
        skinType: editData.skinType,
        formulation: editData.formulation,
        spf: editData.spf,
        fragrance: editData.fragrance,
        packaging: editData.packaging,
        volume: editData.volume,
        weight: editData.weight,
        color: editData.color,
        material: editData.material,
        expiryDate: editData.expiryDate,
      };

      formData.append("price", editData.price);
      formData.append("discountPrice", editData.discountPrice || "");
      formData.append("stock", editData.stock);
      formData.append("sku", editData.sku);
      formData.append("isActive", editData.isActive);

      formData.append("specs", JSON.stringify(specs));
      formData.append("attributes", JSON.stringify(editData.attributes || []));

      if (
        editData.images instanceof FileList ||
        Array.isArray(editData.images)
      ) {
        Array.from(editData.images).forEach((file) =>
          formData.append("images", file)
        );
      }

      const response = await editVariantById(selectedVariant._id, formData);
      dispatch(editVariant(response.data));
      toast.success(response?.message || "Variant updated successfully!");
      setSelectedVariant(null);
      onClose();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Update failed");
      console.error("Error updating variant:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToList = () => {
    setSelectedVariant(null);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Product Variants">
      {selectedVariant ? (
        <form
          onSubmit={handleEditSubmit}
          className="space-y-4 px-2 text-sm text-gray-700"
        >
          <div className="grid grid-cols-2 gap-4">
            <input
              name="price"
              type="number"
              placeholder="Price"
              value={editData.price || ""}
              onChange={handleInputChange}
              className="border p-2 rounded"
              required
            />
            <input
              name="discountPrice"
              type="number"
              placeholder="Discount Price"
              value={editData.discountPrice || ""}
              onChange={handleInputChange}
              className="border p-2 rounded"
            />
            <input
              name="stock"
              type="number"
              placeholder="Stock"
              value={editData.stock || ""}
              onChange={handleInputChange}
              className="border p-2 rounded"
              required
            />
            <input
              name="sku"
              placeholder="SKU"
              value={editData.sku || ""}
              onChange={handleInputChange}
              className="border p-2 rounded"
              required
            />
            {[
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
                placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                value={editData[field] || ""}
                onChange={handleInputChange}
                className="border p-2 rounded"
              />
            ))}
          </div>

          <div className="flex flex-col">
            <span className="text-xs text-gray-600 mx-1">Expiry Date</span>
            <input
              type="date"
              name="expiryDate"
              value={
                editData.expiryDate ? editData.expiryDate.slice(0, 10) : ""
              }
              onChange={handleInputChange}
              className="border border-gray-300 rounded p-2"
            />
          </div>

          {/* Attributes field (JSON string) */}
          <div className="space-y-2">
            <label className="block font-medium text-sm text-gray-700">
              Additional Info(Optional)
            </label>
            {[
              { key: "Usage", label: "Usage Instructions" },
              { key: "Ingredients", label: "Ingredients" },
              { key: "Highlights", label: "Highlights" },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="text-sm text-gray-600">{label}</label>
                <input
                  type="text"
                  name={`attribute-${key}`}
                  value={editData.attributesObj?.[key] || ""}
                  onChange={(e) => {
                    const newAttributes = { ...(editData.attributesObj || {}) };
                    newAttributes[key] = e.target.value;
                    const mappedAttributes = Object.entries(newAttributes).map(
                      ([k, v]) => ({
                        key: k,
                        value: v,
                      })
                    );

                    setEditData((prev) => ({
                      ...prev,
                      attributesObj: newAttributes,
                      attributes: mappedAttributes, // store as array, not string!
                    }));
                  }}
                  className="w-full border p-2 rounded"
                  placeholder={`Enter ${label}`}
                />
              </div>
            ))}
          </div>

          <label className="flex items-center gap-2 mt-2">
            <input
              type="checkbox"
              name="isActive"
              checked={editData.isActive}
              onChange={(e) =>
                setEditData((prev) => ({ ...prev, isActive: e.target.checked }))
              }
            />
            Active
          </label>

          <input
            type="file"
            name="images"
            accept="image/*"
            multiple
            onChange={(e) =>
              setEditData((prev) => ({ ...prev, images: e.target.files }))
            }
            className="mt-2"
            required
          />

          <div className="flex gap-3 pt-2">
            <button
              disabled={isLoading}
              type="submit"
              className="bg-primary text-dark px-4 py-2 rounded flex-1 cursor-pointer"
            >
              {isLoading ? <SvgSpinner /> : "Update"}
            </button>
            <button
              type="button"
              onClick={handleBackToList}
              className="bg-gray-400 text-dark px-4 py-2 rounded flex-1 cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="overflow-x-auto">
          {variants?.length > 0 ? (
            <table className="w-full text-sm text-gray-700 border">
              <thead className="bg-gray-100 text-xs font-semibold">
                <tr>
                  <th className="p-2 border">SKU</th>
                  <th className="p-2 border">Size</th>
                  <th className="p-2 border">Price</th>
                  <th className="p-2 border">Discount Price</th>
                  <th className="p-2 border">Stock</th>
                  <th className="p-2 border">Images</th>
                  <th className="p-2 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {variants.map((variant) => (
                  <tr key={variant._id} className="border-b hover:bg-gray-50">
                    <td className="p-2 border">{variant.sku}</td>
                    <td className="p-2 border">{variant.specs.size}</td>
                    <td className="p-2 border">
                      ₹
                      {Number(
                        variant.price?.$numberDecimal || variant.price
                      ).toFixed(2)}
                    </td>
                    <td className="p-2 border">
                      ₹
                      {Number(
                        variant.discountPrice?.$numberDecimal ||
                          variant.discountPrice
                      ).toFixed(2)}
                    </td>
                    <td className="p-2 border">{variant.stock}</td>
                    <td className="p-2 border">
                      <div className="flex gap-1 overflow-x-auto max-w-[120px] scrollbar-thin">
                        {variant.images?.map((img) => (
                          <img
                            key={img._id}
                            src={img.url}
                            alt="variant"
                            className="w-8 h-8 rounded object-cover shrink-0"
                          />
                        ))}
                      </div>
                    </td>
                    <td className="p-2 border">
                      <div className="flex gap-2 justify-between">
                        <button
                          title="Edit"
                          onClick={() => handleEdit(variant)}
                          className="text-gray-600 hover:text-gray-800 cursor-pointer"
                        >
                          <FaEdit size={16} className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                        <button
                          title="Delete"
                          onClick={() => handleDelete(variant)}
                          className="text-gray-600 hover:text-gray-800 cursor-pointer"
                        >
                          <FaTrash
                            size={16}
                            className="w-4 h-4 sm:w-5 sm:h-5"
                          />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-500 p-4 text-sm">
              No variants available for this product.
            </p>
          )}
        </div>
      )}
    </Modal>
  );
}
export default VariantListModal;
