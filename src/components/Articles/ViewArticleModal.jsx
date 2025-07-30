import React from "react";

const ViewArticleModal = ({ isOpen, onClose, article }) => {
  if (!isOpen || !article) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-xl p-6 relative">
        <button
          className="absolute top-2 right-3 text-gray-500 hover:text-red-500 text-xl"
          onClick={onClose}
        >
          &times;
        </button>

        <h2 className="text-2xl font-semibold mb-4 text-gray-700">
          Article Details
        </h2>

        <div className="space-y-3 text-gray-600">
          <p>
            <span className="font-semibold">Title:</span> {article.title}
          </p>
          <p>
            <span className="font-semibold">Author:</span> {article.author}
          </p>
          <p>
            <span className="font-semibold">Date:</span>{" "}
            {new Date(article.date).toLocaleDateString()}
          </p>
          <p>
            <span className="font-semibold">Description:</span>{" "}
            {article.description}
          </p>
          {article.image && (
            <div>
              <span className="font-semibold">Image:</span>
              <div className="mt-2">
                <img
                  src={article.image}
                  alt="Article"
                  className="w-full max-h-64 object-cover rounded-md border"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewArticleModal;
