import { useState } from "react";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import ViewTestimonialModal from "./ViewTestimonialModal";
import { useTestimonial } from "../../Hooks/useTestimonial";
import api from "../../Api/api";
import EditTestimonialModal from "./EditTestimonialModal";
import TestimonialModal from "./TestimonialModal";

function TestimonialList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(5);

  const [selectedTestimonial, setSelectedTestimonial] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const { testimonials, setTestimonials, fetchTestimonials } = useTestimonial();

  const handleEdit = (testimonial) => {
    setSelectedTestimonial(testimonial);
    setIsEditOpen(true);
  };

  const handleView = (testimonial) => {
    setSelectedTestimonial(testimonial);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this testimonial?")) {
      try {
        await api.delete(`testimonials/${id}`); // Replace with your API endpoint
        // Update the testimonials state USING the setTestimonials function
        const updatedTestimonials = testimonials.filter(
          (testimonial) => testimonial.id !== id
        );
        setTestimonials(updatedTestimonials);
      } catch (error) {
        console.error("Error deleting testimonial:", error);
      }
    }
  };

  // Filter testimonials based on search
  const filteredTestimonials = testimonials?.filter((testimonial) =>
    testimonial?.name?.toLowerCase().includes(searchTerm?.toLowerCase())
  );

  // Pagination Logic
  const totalPages = Math.ceil(filteredTestimonials?.length / perPage);
  const paginatedTestimonials = filteredTestimonials?.slice(
    (page - 1) * perPage,
    page * perPage
  );

  return (
    <div className="max-w-6xl mx-auto p-4 bg-white shadow-md rounded-lg">
      {/* Search Input */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <input
            type="text"
            className="border border-gray-400 p-2 rounded-lg w-64"
            placeholder="Search testimonials..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div>
          <button
            className="bg-primary text-dark px-5 py-2 rounded-lg hover:bg-primary/80 cursor-pointer"
            onClick={() => setShowModal(true)}
          >
            Add Testimonial
          </button>
        </div>
      </div>

      {/* Testimonials Table */}
      <div className="overflow-x-auto">
        <table className="w-full rounded-lg shadow-md">
          <thead className="bg-gray-200 text-slate-600">
            <tr className="text-left">
              <th className="p-3">ID</th>
              <th className="p-3">Name</th>
              <th className="p-3">Description</th>
              <th className="p-3">City</th>
              <th className="p-3">Rating</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedTestimonials?.map((testimonial, index) => (
              <tr
                key={testimonial.id}
                className="hover:bg-gray-100 text-gray-500"
              >
                <td className="p-3">{index + 1 + (page - 1) * perPage}</td>
                <td className="p-3">{testimonial.name}</td>
                <td className="p-3">{testimonial.description}</td>
                <td className="p-3">{testimonial.city}</td>
                <td className="p-3">
                  {Array.from({ length: testimonial.rating }, (_, i) => (
                    <span key={i} className="text-yellow-500">
                      ★
                    </span>
                  ))}
                </td>
                <td className="p-3 flex space-x-3">
                  <button
                    onClick={() => handleView(testimonial)}
                    className="text-primary hover:text-primary/80 cursor-pointer"
                  >
                    <FaEye size={18} />
                  </button>
                  <button
                    onClick={() => handleEdit(testimonial)}
                    className="text-primary hover:text-primary/80 cursor-pointer"
                  >
                    <FaEdit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(testimonial.id)}
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
                  ? "bg-primary text-white"
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

      {/* View Testimonial Modal */}
      <ViewTestimonialModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        testimonial={selectedTestimonial}
      />
      {/* Edit Testimonial Modal */}
      <EditTestimonialModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        testimonial={selectedTestimonial}
        fetchTestimonials={fetchTestimonials}
      />
      <TestimonialModal show={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
}

export default TestimonialList;
