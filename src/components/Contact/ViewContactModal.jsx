
const ViewContactModal = ({ isOpen, onClose, contact }) => {
  if (!isOpen || !contact) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-bold mb-4">Contact Details</h2>
        <div className="space-y-4">
          <p>
            <span className="font-semibold">Name:</span> {contact.name}
          </p>
          <p>
            <span className="font-semibold">Email:</span> {contact.email}
          </p>
          <p>
            <span className="font-semibold">Phone:</span> {contact.phone}
          </p>
          <p>
            <span className="font-semibold">Message:</span> {contact.message}
          </p>
        </div>
        <button
          onClick={onClose}
          className="mt-4 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/80 cursor-pointer"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ViewContactModal;
