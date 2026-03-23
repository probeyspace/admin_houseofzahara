import { useState } from "react";
import {
  FaEye,
  FaEdit,
  FaTrash,
  FaPlusCircle,
  FaListUl,
  FaQuestionCircle,
  FaEnvelope,
  FaSync,
} from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import useProducts from "../../Hooks/useProducts";
import ViewProductModal from "./ViewProductModal";
import { deleteProduct, updateProductData } from "../../store/slices/productSlice";
import {
  deleteProductById,
  toggleProductActive,
  toggleProductPublish,
} from "../../services/products";
import { toast } from "react-toastify";
import AddProductModal from "./AddProductModal";
import AddVariantModal from "./AddVariantModal";
import VariantListModal from "./VariantListModal";
import EditProductModal from "./EditProductModal";
import FAQManagementModal from "./FAQManagementModal";
import WriteUsModal from "./WriteUsModal";
import { syncAllVariantsToZoho } from "../../services/zoho";

function ProductList() {
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [addModal, setAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showVariantList, setShowVariantList] = useState(false);
  const [showAddVariant, setShowAddVariant] = useState(false);
  const [showFAQModal, setShowFAQModal] = useState(false);
  const [showWriteUsModal, setShowWriteUsModal] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);
  const [publishUpdatingId, setPublishUpdatingId] = useState(null);
  useProducts();
  const products = useSelector((store) => store.products);

  const handleView = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteProductById(id);
        dispatch(deleteProduct(id));
        toast.success("Product deleted successfully!");
      } catch (error) {
        console.error("Error deleting product:", error);
      }
    }
  };

  const openAddVariantModal = (product) => {
    setSelectedProduct(product);
    setShowAddVariant(true);
  };

  const openVariantListModal = (product) => {
    setSelectedProduct(product);
    setShowVariantList(true);
  };

  const openEditModal = (product) => {
    setSelectedProduct(product);
    setShowEditModal(true);
  };

  const openFAQModal = (product) => {
    setSelectedProduct(product);
    setShowFAQModal(true);
  };

  const openWriteUsModal = (product) => {
    setSelectedProduct(product);
    setShowWriteUsModal(true);
  };

  const handleSyncAllItems = async () => {
    if (window.confirm("Sync all unsynced variants to Zoho?")) {
      setIsSyncing(true);
      try {
        const res = await syncAllVariantsToZoho();
        const { synced, failed } = res.data;
        toast.info(
          `Bulk item sync complete: ${synced} synced, ${failed} failed`
        );
      } catch (error) {
        toast.error(error?.response?.data?.message || "Bulk sync failed");
        console.error("Error syncing items:", error);
      } finally {
        setIsSyncing(false);
      }
    }
  };

  const handleToggleStatus = async (product) => {
    const nextStatus = !product.isActive;
    setStatusUpdatingId(product._id);
    try {
      const res = await toggleProductActive(product._id, nextStatus);
      dispatch(updateProductData(res.data));
      if (selectedProduct?._id === product._id) {
        setSelectedProduct(res.data);
      }
      toast.success(
        `Product ${nextStatus ? "activated" : "deactivated"} successfully`
      );
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to update product status"
      );
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const handleTogglePublish = async (product) => {
    const currentPublishState = product.isPublished !== false;
    const nextPublishState = !currentPublishState;
    setPublishUpdatingId(product._id);
    try {
      const res = await toggleProductPublish(product._id, nextPublishState);
      dispatch(updateProductData(res.data));
      if (selectedProduct?._id === product._id) {
        setSelectedProduct(res.data);
      }
      toast.success(
        nextPublishState
          ? "Product published successfully"
          : "Product set as coming soon"
      );
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to update publish status"
      );
    } finally {
      setPublishUpdatingId(null);
    }
  };

  // Filter products based on search term
  const filteredProducts = products?.filter((product) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      product.name?.toLowerCase().includes(searchLower) ||
      product.masterCategory?.name?.toLowerCase().includes(searchLower) ||
      product.categories?.some((cat) =>
        cat.name?.toLowerCase().includes(searchLower)
      ) ||
      product.category?.name?.toLowerCase().includes(searchLower) ||
      product.subcategories?.some((sub) =>
        sub.name?.toLowerCase().includes(searchLower)
      ) ||
      product.subcategory?.name?.toLowerCase().includes(searchLower)
    );
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredProducts?.length / perPage);
  const paginatedProducts = filteredProducts?.slice(
    (page - 1) * perPage,
    page * perPage
  );

  return (
    <div className="max-w-6xl mx-auto p-2 sm:p-4 bg-white shadow-md rounded-lg">
      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-3">
        <div className="w-full sm:w-64">
          <input
            type="text"
            className="border border-gray-400 p-2 rounded-lg w-full text-sm sm:text-base"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1); // Reset to first page when searching
            }}
          />
        </div>
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <button
            onClick={handleSyncAllItems}
            disabled={isSyncing}
            className="bg-primary hover:bg-primary/80 text-dark py-2 px-4 rounded cursor-pointer disabled:opacity-50 flex items-center gap-2"
          >
            <FaSync className={isSyncing ? "animate-spin" : ""} size={16} />
            {isSyncing ? "Syncing..." : "Sync All Items to Zoho"}
          </button>
          <button
            onClick={() => setAddModal(true)}
            className="bg-primary hover:bg-primary/80 text-dark py-2 px-4 rounded cursor-pointer"
          >
            Add Product
          </button>
        </div>
      </div>

      {/* Product Table */}
      <div className="overflow-x-auto">
        <table className="w-full rounded-lg shadow-md">
          <thead className="bg-gray-200 text-slate-600">
            <tr className="text-left">
              <th className="p-2 sm:p-3 text-sm sm:text-base">#</th>
              <th className="p-2 sm:p-3 text-sm sm:text-base">Name</th>

              <th className="p-2 sm:p-3 text-sm sm:text-base hidden sm:table-cell">
                Master Category
              </th>
              <th className="p-2 sm:p-3 text-sm sm:text-base hidden sm:table-cell">
                Categories
              </th>
              <th className="p-2 sm:p-3 text-sm sm:text-base hidden sm:table-cell">
                SubCategories
              </th>
              <th className="p-2 sm:p-3 text-sm sm:text-base">Status</th>
              <th className="p-2 sm:p-3 text-sm sm:text-base">Visibility</th>
              <th className="p-2 sm:p-3 text-sm sm:text-base">Variants</th>
              <th className="p-2 sm:p-3 text-sm sm:text-base">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedProducts?.length > 0 ? (
              paginatedProducts?.map((product, index) => (
                <tr
                  key={product._id}
                  className="hover:bg-gray-100 text-gray-500"
                >
                  <td className="p-2 sm:p-3">
                    {index + 1 + (page - 1) * perPage}
                  </td>
                  <td className="p-2 sm:p-3 font-medium">
                    {product.name.length > 15
                      ? product.name.substring(0, 23) + "..."
                      : product.name}
                  </td>

                  <td className="p-2 sm:p-3 hidden sm:table-cell">
                    {product.masterCategory?.name}
                  </td>
                  <td className="p-2 sm:p-3 hidden sm:table-cell">
                    {product.categories?.length > 0
                      ? `${product.categories.length} Categories`
                      : product.category?.name || "N/A"}
                  </td>
                  <td className="p-2 sm:p-3 hidden sm:table-cell">
                    {product.subcategories?.length > 0
                      ? `${product.subcategories.length} SubCats`
                      : product.subcategory?.name || "N/A"}
                  </td>
                  <td className="p-2 sm:p-3">
                    <button
                      onClick={() => handleToggleStatus(product)}
                      disabled={statusUpdatingId === product._id}
                      className={`px-3 py-1 rounded-full text-xs font-semibold border transition cursor-pointer ${
                        product.isActive
                          ? "bg-green-100 text-green-700 border-green-200"
                          : "bg-red-100 text-red-700 border-red-200"
                      } ${
                        statusUpdatingId === product._id
                          ? "opacity-70 cursor-wait"
                          : ""
                      }`}
                    >
                      {statusUpdatingId === product._id
                        ? "Updating..."
                        : product.isActive
                        ? "Active"
                        : "Inactive"}
                    </button>
                  </td>
                  <td className="p-2 sm:p-3">
                    <button
                      onClick={() => handleTogglePublish(product)}
                      disabled={publishUpdatingId === product._id}
                      className={`px-3 py-1 rounded-full text-xs font-semibold border transition cursor-pointer ${
                        product.isPublished !== false
                          ? "bg-blue-100 text-blue-700 border-blue-200"
                          : "bg-yellow-100 text-yellow-700 border-yellow-200"
                      } ${
                        publishUpdatingId === product._id
                          ? "opacity-70 cursor-wait"
                          : ""
                      }`}
                    >
                      {publishUpdatingId === product._id
                        ? "Updating..."
                        : product.isPublished !== false
                        ? "Live"
                        : "Coming Soon"}
                    </button>
                  </td>

                  <td className="p-2 sm:p-3 space-x-2 sm:space-x-3">
                    <button
                      title="Add Variant"
                      onClick={() => openAddVariantModal(product)}
                      className="text-gray-600 hover:text-gray-800 cursor-pointer"
                      aria-label="View product variants"
                    >
                      <FaPlusCircle
                        size={16}
                        className="w-4 h-4 sm:w-5 sm:h-5"
                      />
                    </button>
                    <button
                      title="Variants List"
                      onClick={() => openVariantListModal(product)}
                      className="text-gray-600 hover:text-gray-800 cursor-pointer"
                      aria-label="View product variants"
                    >
                      <FaListUl size={16} className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </td>

                  <td className="p-2 sm:p-3 flex space-x-2 sm:space-x-3">
                    <button
                      title="View Product"
                      onClick={() => handleView(product)}
                      className="text-gray-600 hover:text-gray-800 cursor-pointer"
                      aria-label="View product"
                    >
                      <FaEye size={16} className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                    <button
                      title="Edit Product"
                      onClick={() => openEditModal(product)}
                      className="text-gray-600 hover:text-gray-800 cursor-pointer"
                      aria-label="Edit product"
                    >
                      <FaEdit size={16} className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                    <button
                      title="Delete Product"
                      onClick={() => handleDelete(product._id)}
                      className="text-gray-600 hover:text-gray-800 cursor-pointer"
                      aria-label="Delete product"
                    >
                      <FaTrash size={16} className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                    <button
                      title="Manage FAQs"
                      onClick={() => openFAQModal(product)}
                      className="text-blue-600 hover:text-blue-800 cursor-pointer"
                      aria-label="Manage FAQs"
                    >
                      <FaQuestionCircle
                        size={16}
                        className="w-4 h-4 sm:w-5 sm:h-5"
                      />
                    </button>
                    <button
                      title="View Inquiries"
                      onClick={() => openWriteUsModal(product)}
                      className="text-green-600 hover:text-green-800 cursor-pointer"
                      aria-label="View Inquiries"
                    >
                      <FaEnvelope size={16} className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="9"
                  className="p-2 sm:p-3 text-center text-gray-500"
                >
                  No products listed yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-3">
        <div className="flex items-center">
          <label className="text-gray-600 font-medium mr-2 text-sm sm:text-base">
            Display:
          </label>
          <select
            value={perPage}
            onChange={(e) => setPerPage(Number(e.target.value))}
            className="border border-gray-400 text-gray-600 px-2 py-1 rounded-sm text-sm sm:text-base"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={30}>30</option>
          </select>
        </div>
        <div className="flex items-center overflow-x-auto w-full sm:w-auto justify-center sm:justify-start">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="px-2 sm:px-3 py-1 mx-1 text-sm sm:text-base hover:bg-gray-200 disabled:opacity-50 rounded"
            aria-label="Previous page"
          >
            &lt;
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`px-2 sm:px-3 py-1 mx-1 transition rounded-full text-sm sm:text-base min-w-[2rem] ${
                page === i + 1
                  ? "bg-primary text-dark"
                  : "text-gray-700 hover:bg-gray-200"
              }`}
            >
              {i + 1}
            </button>
          )).slice(0, 5)}
          {totalPages > 5 && <span className="px-1 sm:px-2">...</span>}
          {totalPages > 5 && (
            <button
              onClick={() => setPage(totalPages)}
              className="px-2 sm:px-3 py-1 mx-1 border rounded-lg text-gray-700 hover:bg-gray-200 text-sm sm:text-base"
            >
              {totalPages}
            </button>
          )}
          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className="px-2 sm:px-3 py-1 mx-1 text-sm sm:text-base hover:bg-gray-200 disabled:opacity-50 rounded"
            aria-label="Next page"
          >
            &gt;
          </button>
        </div>
      </div>

      {/* Modals */}
      <ViewProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={selectedProduct}
      />
      <AddProductModal isOpen={addModal} onClose={() => setAddModal(false)} />

      <EditProductModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        productData={selectedProduct}
      />

      <AddVariantModal
        isOpen={showAddVariant}
        onClose={() => setShowAddVariant(false)}
        product={selectedProduct}
      />

      <VariantListModal
        isOpen={showVariantList}
        onClose={() => setShowVariantList(false)}
        variants={selectedProduct?.variants}
      />

      <FAQManagementModal
        isOpen={showFAQModal}
        onClose={() => setShowFAQModal(false)}
        product={selectedProduct}
      />

      <WriteUsModal
        isOpen={showWriteUsModal}
        onClose={() => setShowWriteUsModal(false)}
        product={selectedProduct}
      />
    </div>
  );
}

export default ProductList;
