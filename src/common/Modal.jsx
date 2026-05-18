const Modal = ({ isOpen, onClose, title, children, maxWidth = "max-w-2xl" }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/30">
      <div className={`bg-white rounded-lg shadow-xl ${maxWidth} w-full p-6 relative`}>
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 pb-2">
          <h2 className="text-xl font-semibold"> {title} </h2>
          <button
            onClick={onClose}
            className="absolute top-0 right-4 text-gray-500 hover:text-gray-700 text-3xl cursor-pointer"
          >
            &times;
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="max-h-[80vh] overflow-y-auto pr-2">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
