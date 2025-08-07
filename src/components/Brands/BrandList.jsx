import { useState } from "react";
import { FaTrash, FaEye } from "react-icons/fa";
import { useBrand } from "../../Hooks/useBrand";
import CreateBrandModal from "./CreateBrandModal";
import ViewBrandModal from "./ViewBrandModal";

function BrandList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(5);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const { brands, deleteBrand, fetchBrands } = useBrand();

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this brand?")) {
      try {
        await deleteBrand(id);
      } catch (error) {
        console.error("Error deleting brand:", error);
      }
    }
  };

  const handleView = (brand) => {
    setSelectedBrand(brand);
    setIsViewModalOpen(true);
  };

  // Filter brands based on search
  const filteredBrands = brands?.filter((brand) =>
    brand?.name?.toLowerCase().includes(searchTerm?.toLowerCase())
  );

  // Pagination Logic
  const totalPages = Math.ceil(filteredBrands?.length / perPage);
  const paginatedBrands = filteredBrands?.slice(
    (page - 1) * perPage,
    page * perPage
  );

  return (
    <div className="max-w-6xl mx-auto p-4 bg-white shadow-md rounded-lg">
      {/* Header and Create Button */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Brands</h1>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/80 cursor-pointer"
        >
          Create Brand
        </button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          className="border border-gray-400 p-2 rounded-lg w-full md:w-64"
          placeholder="Search by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Brands Table */}
      <div className="overflow-x-auto">
        <table className="w-full rounded-lg shadow-md">
          <thead className="bg-gray-200 text-slate-600">
            <tr className="text-left">
              <th className="p-3">ID</th>
              <th className="p-3">Name</th>
              <th className="p-2 sm:p-3 hidden md:table-cell">Description</th>
              <th className="p-2 sm:p-3 hidden md:table-cell">Website</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedBrands?.map((brand, index) => (
              <tr key={brand._id} className="hover:bg-gray-100 text-gray-500">
                <td className="p-3">{index + 1 + (page - 1) * perPage}</td>
                <td className="p-3">{brand.name}</td>
                <td className="p-2 sm:p-3 hidden md:table-cell">
                  {brand.description}
                </td>
                <td className="p-2 sm:p-3 hidden md:table-cell">
                  <a
                    href={brand.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline cursor-pointer"
                  >
                    {brand.website || "N/A"}
                  </a>
                </td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded-full text-sm ${
                      brand.isActive
                        ? "bg-green-100 text-green-600"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {brand.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="p-3 flex space-x-3">
                  <button
                    onClick={() => handleView(brand)}
                    className="text-primary hover:text-primary/80 cursor-pointer"
                  >
                    <FaEye size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(brand._id)}
                    className="text-primary hover:text-primary/80 cursor-pointer"
                  >
                    <FaTrash size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-4">
        <div>
          <label className="text-gray-600 font-medium mr-2">Display:</label>
          <select
            value={perPage}
            onChange={(e) => setPerPage(Number(e.target.value))}
            className="border border-gray-400 text-gray-600 px-2 py-1 rounded-sm"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
        </div>
        <div className="flex items-center">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="px-3 py-1 mx-1 text-lg hover:bg-gray-200 disabled:opacity-50"
          >
            &lt;
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`px-3 py-1 mx-1 transition rounded-full ${
                page === i + 1
                  ? "bg-primary text-dark"
                  : "text-gray-700 hover:bg-gray-200"
              }`}
            >
              {i + 1}
            </button>
          )).slice(0, 5)}
          {totalPages > 5 && <span className="px-2">...</span>}
          {totalPages > 5 && (
            <button
              onClick={() => setPage(totalPages)}
              className="px-3 py-1 mx-1 border rounded-lg text-gray-700 hover:bg-gray-200"
            >
              {totalPages}
            </button>
          )}
          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className="px-3 py-1 mx-1 text-lg hover:bg-gray-200 disabled:opacity-50"
          >
            &gt;
          </button>
        </div>
      </div>

      {/* Create Brand Modal */}
      <CreateBrandModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        fetchBrands={fetchBrands}
      />

      {/* View Brand Modal */}
      <ViewBrandModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        brand={selectedBrand}
      />
    </div>
  );
}

export default BrandList;
