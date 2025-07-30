import { useState } from "react";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import useProducts from "../../Hooks/useProducts";
import ViewProductModal from "./ViewProductModal";
import { deleteProduct, verifyProduct } from "../../store/slices/productSlice";
// import EditProductModal from "./EditProductModal";
import { deleteProductById, verifyProductById } from "../../services/products";
import { toast } from "react-toastify";

function ProductList() {
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(5);
  const [filterStatus, setFilterStatus] = useState("all");

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  // const [editModal, setEditModal] = useState(false);
  useProducts();
  const products = useSelector((store) => store.products);

  // const handleEdit = (product) => {
  //   setSelectedProduct(product);
  //   setEditModal(true);
  // };

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

  const handleVerify = async (product) => {
    try {
      await verifyProductById(product.id, !product.isVerified);
      dispatch(
        verifyProduct({ id: product.id, isVerified: !product.isVerified })
      );
      toast.success(
        `Product ${
          product.isVerified ? "unverified" : "verified"
        } successfully!`
      );
    } catch (error) {
      console.error("Error verifying product:", error);
    }
  };

  // Filter products
  let filteredProducts = products
    ?.filter((product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((product) => {
      if (filterStatus === "verified") return product.isVerified;
      if (filterStatus === "pending") return !product.isVerified;
      return true;
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
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <label className="text-gray-600 font-medium text-sm sm:text-base">
            Filter:
          </label>
          <select
            className="border border-gray-400 text-gray-600 px-2 py-1 rounded-sm text-sm sm:text-base w-full sm:w-auto"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All</option>
            <option value="verified">Verified</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      {/* Product Table */}
      <div className="overflow-x-auto">
        <table className="w-full rounded-lg shadow-md">
          <thead className="bg-gray-200 text-slate-600">
            <tr className="text-left">
              <th className="p-2 sm:p-3 text-sm sm:text-base">#</th>
              <th className="p-2 sm:p-3 text-sm sm:text-base">Name</th>
              <th className="p-2 sm:p-3 text-sm sm:text-base">Store Name</th>
              <th className="p-2 sm:p-3 text-sm sm:text-base hidden sm:table-cell">
                Category
              </th>
              <th className="p-2 sm:p-3 text-sm sm:text-base">Actions</th>
              <th className="p-2 sm:p-3 text-sm sm:text-base">Verified</th>
            </tr>
          </thead>
          <tbody>
            {paginatedProducts?.length > 0 ? (
              paginatedProducts?.map((product, index) => (
                <tr
                  key={product.id}
                  className="hover:bg-gray-100 text-gray-500"
                >
                  <td className="p-2 sm:p-3">
                    {index + 1 + (page - 1) * perPage}
                  </td>
                  <td className="p-2 sm:p-3 font-medium">
                    {product.name.length > 15
                      ? product.name.substring(0, 25)
                      : product.name}
                  </td>
                  <td className="p-2 sm:p-3 hidden sm:table-cell">
                    {product.vendor?.storeName}
                  </td>
                  <td className="p-2 sm:p-3 hidden sm:table-cell">
                    {product.category?.name}
                  </td>
                  <td className="p-2 sm:p-3 flex space-x-2 sm:space-x-3">
                    <button
                      onClick={() => handleView(product)}
                      className="text-primary hover:text-primary/80 cursor-pointer"
                      aria-label="View product"
                    >
                      <FaEye size={16} className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                    {/* <button
                      onClick={() => handleEdit(product)}
                      className="text-green-600 hover:text-green-800 cursor-pointer"
                      aria-label="Edit product"
                    >
                      <FaEdit size={16} className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button> */}
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="text-primary hover:text-primary/80 cursor-pointer"
                      aria-label="Delete product"
                    >
                      <FaTrash size={16} className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </td>
                  <td className="p-2 sm:p-3">
                    <label className="relative inline-block w-8 h-4 sm:w-10 sm:h-5">
                      <input
                        type="checkbox"
                        checked={product.isVerified}
                        onChange={() => handleVerify(product)}
                        className="peer sr-only"
                      />
                      <div className="w-full h-full bg-gray-300 rounded-full peer-checked:bg-primary transition-all duration-300"></div>
                      <div className="absolute top-0.5 left-0.5 w-3 h-3 sm:w-4 sm:h-4 bg-white rounded-full shadow-sm transition-all duration-300 peer-checked:translate-x-3 sm:peer-checked:translate-x-5"></div>
                    </label>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="6"
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
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
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
      {/* <EditProductModal
        isOpen={editModal}
        onClose={() => setEditModal(false)}
        product={selectedProduct}
      /> */}
    </div>
  );
}

export default ProductList;
