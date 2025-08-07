import { useState } from "react";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import { useSelector } from "react-redux";
import ViewBannerModal from "./ViewBannerModal";
import { useBanner } from "../../Hooks/useBanner";
import api from "../../Api/api";
import EditBannerModal from "./EditBannerModal";
import BannerModal from "./BannerModal";

function BannerList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(5);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedBanner, setSelectedBanner] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [addModal, setAddModal] = useState(false);
  const { banners, setBanners, fetchBanner } = useBanner();

  const handleEdit = (banner) => {
    setSelectedBanner(banner);
    setEditModal(true);
  };

  const handleView = (banner) => {
    setSelectedBanner(banner);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this banner?")) {
      try {
        await api.delete(`/banner/${id}`);
        const updatedBanners = banners.filter((banner) => banner._id !== id);
        setBanners(updatedBanners);
      } catch (error) {
        console.error("Error deleting banner:", error);
      }
    }
  };

  // Filter banners based on search, date range, and status
  const filteredBanners = banners?.filter((banner) => {
    const matchesSearch = banner?.title
      ?.toLowerCase()
      .includes(searchTerm?.toLowerCase());
    const matchesStatus = statusFilter
      ? banner.isActive === (statusFilter === "ACTIVE")
      : true;
    const matchesDateRange =
      (!startDate || new Date(banner.createdAt) >= new Date(startDate)) &&
      (!endDate || new Date(banner.createdAt) <= new Date(endDate));

    return matchesSearch && matchesStatus && matchesDateRange;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredBanners?.length / perPage);
  const paginatedBanners = filteredBanners?.slice(
    (page - 1) * perPage,
    page * perPage
  );

  return (
    <div className="max-w-6xl mx-auto p-2 sm:p-4 bg-white shadow-md rounded-lg">
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-2 justify-between sm:gap-4 mb-4">
        {/* Search by Title */}
        <div className="flex flex-col md:flex-row gap-2">
          <input
            type="text"
            className="border border-gray-400 p-2 rounded-lg w-full md:w-64"
            placeholder="Search by Title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {/* Filter by Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-400 p-2 rounded-lg w-full md:w-64"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
        <div>
          <button
            className="bg-primary text-dark px-5 py-2.5 rounded-lg hover:bg-primary/80 cursor-pointer"
            onClick={() => setAddModal(true)}
          >
            Add Banner
          </button>
        </div>
      </div>

      {/* Banners Table */}
      <div className="overflow-x-auto">
        <table className="w-full rounded-lg shadow-md">
          <thead className="bg-gray-200 text-slate-600">
            <tr className="text-left">
              <th className="p-2 sm:p-3">ID</th>
              <th className="p-2 sm:p-3">Title</th>
              <th className="p-2 sm:p-3 hidden sm:table-cell">Description</th>
              <th className="p-2 sm:p-3 hidden md:table-cell">Offer</th>
              <th className="p-2 sm:p-3">Status</th>
              <th className="p-2 sm:p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedBanners?.map((banner, index) => (
              <tr key={banner._id} className="hover:bg-gray-100 text-gray-500">
                <td className="p-2 sm:p-3">
                  {index + 1 + (page - 1) * perPage}
                </td>
                <td className="p-2 sm:p-3">{banner.title}</td>
                <td className="p-2 sm:p-3 hidden sm:table-cell">
                  {banner.description.length > 30
                    ? `${banner.description.substring(0, 30)}...`
                    : banner.description}
                </td>
                <td className="p-2 sm:p-3 hidden md:table-cell">
                  {banner.offer}
                </td>

                <td className="p-2 sm:p-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs sm:text-sm ${
                      banner.isActive
                        ? "bg-green-100 text-green-600"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {banner.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="p-2 sm:p-3 flex space-x-2 sm:space-x-3">
                  <button
                    onClick={() => handleView(banner)}
                    className="text-gray-600 hover:text-gray-800 cursor-pointer"
                    aria-label="View"
                  >
                    <FaEye size={18} className="sm:w-4 sm:h-4" />
                  </button>
                  <button
                    onClick={() => handleEdit(banner)}
                    className="text-gray-600 hover:text-gray-800 cursor-pointer"
                    aria-label="Edit"
                  >
                    <FaEdit size={18} className="sm:w-4 sm:h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(banner._id)}
                    className="text-gray-600 hover:text-gray-800 cursor-pointer"
                    aria-label="Delete"
                  >
                    <FaTrash size={18} className="sm:w-4 sm:h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-4">
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
        <div className="flex items-center overflow-x-auto">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="px-2 sm:px-3 py-1 mx-1 text-sm sm:text-lg hover:bg-gray-200 disabled:opacity-50 rounded"
            aria-label="Previous page"
          >
            &lt;
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`px-2 sm:px-3 py-1 mx-1 transition rounded-full text-sm sm:text-base ${
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
            className="px-2 sm:px-3 py-1 mx-1 text-sm sm:text-lg hover:bg-gray-200 disabled:opacity-50 rounded"
            aria-label="Next page"
          >
            &gt;
          </button>
        </div>
      </div>

      {/* View Banner Modal */}
      <ViewBannerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        banner={selectedBanner}
      />
      <EditBannerModal
        isOpen={editModal}
        onClose={() => setEditModal(false)}
        bannerData={selectedBanner}
        fetchBanner={fetchBanner}
      />

      <BannerModal
        show={addModal}
        onClose={() => setAddModal(false)}
        fetchBanner={fetchBanner}
      />
    </div>
  );
}

export default BannerList;
