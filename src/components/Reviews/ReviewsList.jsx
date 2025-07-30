import { useEffect, useState } from "react";
import api from "../../Api/api";
import { BiTrash } from "react-icons/bi";

const ReviewsList = () => {
  const [reviews, setReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [filter, setFilter] = useState("All");
  const [sortOrder, setSortOrder] = useState("Latest");

  useEffect(() => {
    fetchReviews();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [reviews, filter, sortOrder]);

  const fetchReviews = async () => {
    try {
      const response = await api.get("/reviews");
      setReviews(response.data.data);
    } catch (error) {
      console.error("Error fetching reviews:", error);
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
          return review.id !== id;
        })
      );
    } catch (error) {
      console.error("Error updating review verification:", error);
    }
  };

  const applyFilters = () => {
    let updatedReviews = [...reviews];

    if (filter === "Verified") {
      updatedReviews = updatedReviews.filter((review) => review.isVerified);
    } else if (filter === "Unverified") {
      updatedReviews = updatedReviews.filter((review) => !review.isVerified);
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

  return (
    <div className="max-w-6xl mx-auto p-4 bg-white shadow-md rounded-lg">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
        <h2 className="text-2xl font-semibold text-gray-800">Reviews List</h2>
        <div className="flex gap-4">
          {/* <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-gray-400 p-2 rounded-lg text-gray-700"
          >
            <option value="All">All</option>
            <option value="Verified">Verified</option>
            <option value="Unverified">Unverified</option>
          </select> */}

          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="border border-gray-400 p-2 rounded-lg text-gray-700"
          >
            <option value="Latest">Latest</option>
            <option value="Oldest">Oldest</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full rounded-lg shadow-md">
          <thead className="bg-gray-200 text-slate-600">
            <tr className="text-left">
              <th className="p-3">Product Name</th>
              <th className="p-3">User Name</th>
              <th className="p-3">Rating</th>
              <th className="p-3">Comment</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredReviews.map((review) => (
              <tr
                key={review.id}
                className="hover:bg-gray-100 text-gray-500 text-sm border-t"
              >
                <td className="p-3">{review.product?.name || "N/A"}</td>
                <td className="p-3">{review.user?.name}</td>
                <td className="p-3">{"⭐".repeat(review.rating)}</td>
                <td className="p-3 max-w-xs break-words whitespace-pre-wrap">
                  {review.comment}
                </td>
                <td className="p-3 text-center">
                  <button
                    title="Delete Log"
                    className="text-primary hover:text-primary/50 cursor-pointer"
                    onClick={() => handleDelete(review.id)}
                  >
                    <BiTrash size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReviewsList;
