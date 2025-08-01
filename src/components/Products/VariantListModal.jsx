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
      price: variant.price?.$numberDecimal || variant.price, // Extract numeric string
      discountPrice:
        variant.discountPrice?.$numberDecimal || variant.discountPrice, // Extract numeric string
    };
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
      for (const key in editData) {
        if (key === "images" && editData.images instanceof FileList) {
          Array.from(editData.images).forEach((file) => {
            formData.append("images", file);
          });
        } else {
          formData.append(key, editData[key]);
        }
      }

      const response = await editVariantById(selectedVariant._id, formData);
      dispatch(editVariant(response.data)); // ✅ Redux store update
      toast.success(response?.message || "Variant updated successfully!");
      setSelectedVariant(null); // ✅ Exit edit mode
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
          <h3 className="text-md font-semibold">Edit Variant</h3>
          <div className="grid grid-cols-2 gap-4">
            <input
              name="shade"
              placeholder="Shade"
              value={editData.shade || ""}
              onChange={handleInputChange}
              className="border p-2 rounded"
            />
            <input
              name="size"
              placeholder="Size"
              value={editData.size || ""}
              onChange={handleInputChange}
              className="border p-2 rounded"
            />
            <input
              name="finish"
              placeholder="Finish"
              value={editData.finish || ""}
              onChange={handleInputChange}
              className="border p-2 rounded"
            />
            <input
              name="skinType"
              placeholder="Skin Type"
              value={editData.skinType || ""}
              onChange={handleInputChange}
              className="border p-2 rounded"
            />
            <input
              name="formulation"
              placeholder="Formulation"
              value={editData.formulation || ""}
              onChange={handleInputChange}
              className="border p-2 rounded"
            />
            <input
              name="spf"
              placeholder="Spf"
              value={editData.spf || ""}
              onChange={handleInputChange}
              className="border p-2 rounded"
            />
            <input
              name="fragrance"
              placeholder="Fragrance"
              value={editData.fragrance || ""}
              onChange={handleInputChange}
              className="border p-2 rounded"
            />
            <input
              name="packaging"
              placeholder="Packaging"
              value={editData.packaging || ""}
              onChange={handleInputChange}
              className="border p-2 rounded"
            />
            <input
              name="price"
              type="number"
              placeholder="Price"
              value={editData.price || ""}
              onChange={handleInputChange}
              className="border p-2 rounded"
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
            />
            <input
              name="sku"
              placeholder="SKU"
              value={editData.sku || ""}
              onChange={handleInputChange}
              className="border p-2 rounded"
            />
          </div>

          {/* Active Checkbox */}
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

          {/* File Upload */}
          <div className="mt-2">
            <input
              type="file"
              name="images"
              accept="image/*"
              multiple
              onChange={(e) =>
                setEditData((prev) => ({ ...prev, images: e.target.files }))
              }
            />
          </div>

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
                  <th className="p-2 border">Shade</th>
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
                    <td className="p-2 border">{variant.size}</td>
                    <td className="p-2 border">{variant.shade}</td>
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
