import { useState } from "react";
import { FaEye, FaTrash } from "react-icons/fa";
import ViewContactModal from "./ViewContactModal";
import { useContact } from "../../Hooks/useContact";
import api from "../../Api/api";
import { toast } from "react-toastify";

function ContactList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(5);

  const [selectedContact, setSelectedContact] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { contacts, setData } = useContact();

  const handleView = (contact) => {
    setSelectedContact(contact);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this contact?")) {
      try {
        await api.delete(`/contact/${id}`);
        const updatedContacts = contacts.filter((contact) => contact.id !== id);
        setData(updatedContacts);
        toast.success("Contact deleted successfully!");
      } catch (error) {
        console.error("Error deleting contact:", error);
      }
    }
  };

  const filteredContacts = contacts?.filter((contact) =>
    contact?.name?.toLowerCase().includes(searchTerm?.toLowerCase())
  );

  const totalPages = Math.ceil(filteredContacts?.length / perPage);
  const paginatedContacts = filteredContacts?.slice(
    (page - 1) * perPage,
    page * perPage
  );

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      {/* Search */}
      <div className="flex justify-between items-center mb-2">
        <input
          type="text"
          className="border border-gray-400 p-2 rounded-lg w-full max-w-xs"
          placeholder="Search contacts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Contacts Table */}
      <div className="w-full bg-white p-3 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-2">Contacts</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-200 text-slate-600">
              <tr className="text-left">
                <th className="p-2">ID</th>
                <th className="p-2">Name</th>
                <th className="p-2">Email</th>
                <th className="p-2">Phone</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedContacts?.length > 0 ? (
                paginatedContacts.map((contact, index) => (
                  <tr
                    key={contact.id}
                    className="hover:bg-gray-100 text-gray-500"
                  >
                    <td className="p-2">{index + 1 + (page - 1) * perPage}</td>
                    <td className="p-2">{contact.name}</td>
                    <td className="p-2">{contact.email}</td>
                    <td className="p-2">{contact.phone}</td>
                    <td className="p-2 flex space-x-3">
                      <button
                        onClick={() => handleView(contact)}
                        className="text-primary hover:text-primary/80 cursor-pointer"
                      >
                        <FaEye size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(contact.id)}
                        className="text-primary hover:text-primary/80 cursor-pointer"
                      >
                        <FaTrash size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-gray-400">
                    No contacts found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
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
              className="px-3 py-1 mx-1 hover:bg-gray-200 disabled:opacity-50"
            >
              &lt;
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`px-3 py-1 mx-1 rounded-full transition ${
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
                className="px-3 py-1 mx-1 text-gray-700 hover:bg-gray-200"
              >
                {totalPages}
              </button>
            )}
            <button
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              className="px-3 py-1 mx-1 hover:bg-gray-200 disabled:opacity-50"
            >
              &gt;
            </button>
          </div>
        </div>
      </div>

      {/* View Modal */}
      <ViewContactModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        contact={selectedContact}
      />
    </div>
  );
}

export default ContactList;
