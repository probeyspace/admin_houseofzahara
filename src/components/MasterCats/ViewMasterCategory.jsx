import React from "react";

const ViewMasterCategory = ({ isOpen, onClose, masterCategory }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-bold mb-4">MasterCategory Details</h2>
        <div className="space-y-4 flex gap-2">
          <div>
            <p className="mb-2">
              <span className="font-semibold">Name:</span>{" "}
              {masterCategory?.name}
            </p>

            <p className="mb-2">
              <span className="font-semibold">Description:</span>{" "}
              {masterCategory?.description}
            </p>
          </div>

          <div>
            <img
              src={masterCategory?.image}
              alt="masterCategory"
              className="w-40 h-40 object-cover rounded-lg"
            />
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-6 bg-primary text-dark px-4 py-2 rounded-lg hover:bg-primary/80 cursor-pointer"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ViewMasterCategory;
