import { useEffect, useState } from "react";
import api from "../../Api/api";
import { BiTrash, BiSearch } from "react-icons/bi";
import { toast } from "react-toastify";

const ReviewsList = () => {
  const [reviews, setReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [filter, setFilter] = useState("All");
  const [sortOrder, setSortOrder] = useState("Latest");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    fetchReviews();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [reviews, filter, sortOrder, searchQuery]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const response = await api.get("/reviews");
      setReviews(response.data.data || []);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      await api.patch(`/reviews/${id}`, {
        isVerified: !currentStatus,
      });
      setReviews((prevReviews) =>
        prevReviews.map((review) =>
          review._id === id ? { ...review, isVerified: !currentStatus } : review
        )
      );
      toast.success(
        !currentStatus
          ? "Review activated and visible on product page"
          : "Review deactivated"
      );
    } catch (error) {
      console.error("Error updating review status:", error);
      toast.error("Failed to update review status");
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this review?"
    );

    if (!confirmDelete) {
      return;
    }
    try {
      await api.delete(`/reviews/${id}`);
      setReviews(
        reviews.filter((review) => {
          return review._id !== id;
        })
      );
      toast.success("Review deleted successfully");
    } catch (error) {
      console.error("Error deleting review:", error);
      toast.error("Failed to delete review");
    }
  };

  const applyFilters = () => {
    let updatedReviews = [...reviews];

    if (filter === "Verified" || filter === "Active") {
      updatedReviews = updatedReviews.filter((review) => review.isVerified);
    } else if (filter === "Unverified" || filter === "Inactive") {
      updatedReviews = updatedReviews.filter((review) => !review.isVerified);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      updatedReviews = updatedReviews.filter((review) => {
        const productName = review.product?.name?.toLowerCase() || "";
        const userName = review.user?.name?.toLowerCase() || "";
        const userEmail = review.user?.email?.toLowerCase() || "";
        const comment = review.comment?.toLowerCase() || "";
        return (
          productName.includes(q) ||
          userName.includes(q) ||
          userEmail.includes(q) ||
          comment.includes(q)
        );
      });
    }

    if (sortOrder === "Latest") {
      updatedReviews.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
    } else {
      updatedReviews.sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      );
    }

    setFilteredReviews(updatedReviews);
  };

  const getProductImage = (product) => {
    if (!product) return null;
    if (product.thumbnailImages && product.thumbnailImages.length > 0) {
      const imgObj = product.thumbnailImages[0];
      return typeof imgObj === "string" ? imgObj : imgObj.url || imgObj.secure_url;
    }
    return null;
  };

  return (
    <div className="max-w-7xl mx-auto p-4 bg-white shadow-md rounded-lg">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-gray-100 pb-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">Product Reviews</h2>
          <p className="text-xs text-gray-500 mt-1">
            Total Reviews: {reviews.length} | Showing: {filteredReviews.length}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Search bar */}
          <div className="relative flex-1 md:w-64">
            <BiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search product, user or comment..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-black transition"
            />
          </div>

          {/* Filter status */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-gray-300 p-2 rounded-lg text-sm text-gray-700 outline-none focus:border-black"
          >
            <option value="All">All Reviews</option>
            <option value="Active">Active Only</option>
            <option value="Inactive">Inactive Only</option>
          </select>

          {/* Sort order */}
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="border border-gray-300 p-2 rounded-lg text-sm text-gray-700 outline-none focus:border-black"
          >
            <option value="Latest">Latest First</option>
            <option value="Oldest">Oldest First</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr className="text-left border-b border-gray-200">
              <th className="p-3 font-semibold">#</th>
              <th className="p-3 font-semibold">Product</th>
              <th className="p-3 font-semibold">User</th>
              <th className="p-3 font-semibold">Rating</th>
              <th className="p-3 font-semibold">Comment & Media</th>
              <th className="p-3 font-semibold text-center">Status</th>
              <th className="p-3 font-semibold text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="text-center p-8 text-gray-500">
                  Loading reviews...
                </td>
              </tr>
            ) : filteredReviews.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center p-8 text-gray-500">
                  No reviews found matching your search.
                </td>
              </tr>
            ) : (
              filteredReviews.map((review, index) => {
                const prodImg = getProductImage(review.product);
                return (
                  <tr
                    key={review._id}
                    className="hover:bg-gray-50 text-gray-700 border-b border-gray-100 last:border-b-0 transition-colors"
                  >
                    <td className="p-3 text-gray-400 font-mono">{index + 1}</td>

                    {/* Product Name & Image */}
                    <td className="p-3">
                      <div className="flex items-center gap-3 min-w-[200px]">
                        {prodImg ? (
                          <img
                            src={prodImg}
                            alt={review.product?.name || "Product"}
                            className="w-12 h-12 object-cover rounded-md border border-gray-200 shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-100 rounded-md border border-gray-200 flex items-center justify-center text-xs text-gray-400 shrink-0 font-semibold">
                            No Img
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-gray-800 line-clamp-2">
                            {review.product?.name || (
                              <span className="text-red-500 italic">Deleted / Unknown Product</span>
                            )}
                          </p>
                          {review.product?.brandName && (
                            <span className="text-xs text-gray-500 block">
                              Brand: {review.product.brandName}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* User */}
                    <td className="p-3">
                      <div className="min-w-[120px]">
                        <p className="font-medium text-gray-800">
                          {review.user?.name || "Anonymous"}
                        </p>
                        {review.user?.email && (
                          <p className="text-xs text-gray-500">{review.user.email}</p>
                        )}
                      </div>
                    </td>

                    {/* Rating */}
                    <td className="p-3 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-500 text-base">
                          {"★".repeat(review.rating || 5)}
                        </span>
                        <span className="text-gray-300 text-base">
                          {"★".repeat(5 - (review.rating || 5))}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400">({review.rating || 5}/5)</span>
                    </td>

                    {/* Comment & Attached Image */}
                    <td className="p-3 max-w-sm">
                      <p className="break-words whitespace-pre-wrap text-gray-700">
                        {review.comment || <span className="text-gray-400 italic">No comment text</span>}
                      </p>
                      {review.image && (
                        <div className="mt-2">
                          <img
                            src={review.image}
                            alt="Review attachment"
                            onClick={() => setPreviewImage(review.image)}
                            className="w-14 h-14 object-cover rounded border border-gray-200 cursor-pointer hover:opacity-80 transition"
                            title="Click to expand image"
                          />
                        </div>
                      )}
                      <span className="text-[11px] text-gray-400 block mt-1">
                        {new Date(review.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleToggleStatus(review._id, review.isVerified)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          review.isVerified ? "bg-green-600" : "bg-gray-300"
                        }`}
                        title={review.isVerified ? "Deactivate Review" : "Activate Review"}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                            review.isVerified ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                      <span className="block text-[11px] font-medium text-gray-500 mt-1">
                        {review.isVerified ? "Active" : "Inactive"}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="p-3 text-center">
                      <button
                        title="Delete Review"
                        className="text-gray-500 hover:text-red-700 cursor-pointer p-1 transition"
                        onClick={() => handleDelete(review._id)}
                      >
                        <BiTrash size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative max-w-2xl bg-white rounded-lg p-2 overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-2 right-2 bg-black/70 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold hover:bg-black transition"
            >
              ✕
            </button>
            <img
              src={previewImage}
              alt="Expanded review image"
              className="max-h-[80vh] w-auto object-contain rounded"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewsList;
