import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import {
  fetchFAQsByProduct,
  createFAQ,
  updateFAQ,
  deleteFAQ,
} from "../../services/faq";
import SvgSpinner from "../../common/SvgSpinner";

const FAQManagementModal = ({ isOpen, onClose, product }) => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);
  const [formData, setFormData] = useState({
    question: "",
    answer: "",
    order: 0,
  });

  // Fetch FAQs when modal opens
  useEffect(() => {
    if (isOpen && product?._id) {
      loadFAQs();
    }
  }, [isOpen, product]);

  const loadFAQs = async () => {
    try {
      setLoading(true);
      const data = await fetchFAQsByProduct(product._id);
      setFaqs(data || []);
    } catch (error) {
      toast.error("Failed to load FAQs");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (editingFaq) {
        // Update existing FAQ
        await updateFAQ(editingFaq._id, formData);
        toast.success("FAQ updated successfully");
      } else {
        // Create new FAQ
        await createFAQ(product._id, formData);
        toast.success("FAQ added successfully");
      }
      resetForm();
      loadFAQs();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to save FAQ");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (faq) => {
    setEditingFaq(faq);
    setFormData({
      question: faq.question,
      answer: faq.answer,
      order: faq.order || 0,
    });
    setShowAddForm(true);
  };

  const handleDelete = async (faqId) => {
    if (window.confirm("Are you sure you want to delete this FAQ?")) {
      try {
        await deleteFAQ(faqId);
        toast.success("FAQ deleted successfully");
        loadFAQs();
      } catch (error) {
        toast.error("Failed to delete FAQ");
      }
    }
  };

  const resetForm = () => {
    setFormData({ question: "", answer: "", order: 0 });
    setEditingFaq(null);
    setShowAddForm(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-black/30 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-[700px] max-w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Manage FAQs - {product?.name}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Add/Edit Form */}
        {showAddForm ? (
          <form
            onSubmit={handleSubmit}
            className="mb-6 border p-4 rounded-lg bg-gray-50"
          >
            <h3 className="font-semibold mb-3">
              {editingFaq ? "Edit FAQ" : "Add New FAQ"}
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Question *
                </label>
                <input
                  type="text"
                  value={formData.question}
                  onChange={(e) =>
                    setFormData({ ...formData, question: e.target.value })
                  }
                  className="w-full border p-2 rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Answer *
                </label>
                <textarea
                  value={formData.answer}
                  onChange={(e) =>
                    setFormData({ ...formData, answer: e.target.value })
                  }
                  className="w-full border p-2 rounded"
                  rows={3}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Order (for sorting)
                </label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      order: parseInt(e.target.value),
                    })
                  }
                  className="w-full border p-2 rounded"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-primary text-dark px-4 py-2 rounded cursor-pointer"
                  disabled={loading}
                >
                  {loading ? <SvgSpinner /> : editingFaq ? "Update" : "Add FAQ"}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-400 text-dark px-4 py-2 rounded cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setShowAddForm(true)}
            className="mb-4 bg-primary text-dark px-4 py-2 rounded cursor-pointer flex items-center gap-2"
          >
            <FaPlus /> Add New FAQ
          </button>
        )}

        {/* FAQs List */}
        {loading && !showAddForm ? (
          <div className="text-center py-8">
            <SvgSpinner />
          </div>
        ) : faqs.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No FAQs yet. Add your first one!
          </p>
        ) : (
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div
                key={faq._id}
                className="border border-gray-300 p-4 rounded-lg bg-white hover:shadow-md transition"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs text-gray-500">
                    FAQ #{index + 1}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(faq)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Edit FAQ"
                    >
                      <FaEdit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(faq._id)}
                      className="text-red-600 hover:text-red-800"
                      title="Delete FAQ"
                    >
                      <FaTrash size={16} />
                    </button>
                  </div>
                </div>
                <div>
                  <p className="font-semibold text-gray-800 mb-1">
                    Q: {faq.question}
                  </p>
                  <p className="text-gray-600 text-sm">A: {faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Close Button */}
        <div className="mt-6">
          <button
            onClick={onClose}
            className="w-full bg-gray-400 text-dark px-4 py-2 rounded cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default FAQManagementModal;
