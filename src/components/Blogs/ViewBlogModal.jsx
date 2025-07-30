
function ViewBlogModal({ isOpen, onClose, blog }) {
  if (!isOpen || !blog) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/30 px-4">
      <div className="bg-white w-full max-w-3xl rounded-lg shadow-xl p-6 relative overflow-y-auto max-h-[90vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-red-600 text-xl font-bold"
        >
          &times;
        </button>

        {/* Blog Cover */}
        <div className="mb-4">
          <img
            src={blog.coverImage}
            alt="Cover"
            className="w-full h-64 object-cover rounded-lg"
          />
        </div>

        {/* Blog Details */}
        <h2 className="text-2xl font-bold text-gray-800 mb-1">{blog.title}</h2>
        <p className="text-gray-600 mb-2">
          <strong>Author:</strong> {blog.author}
        </p>
        {blog.blogCategory && (
          <p className="text-gray-600 mb-2">
            <strong>Category:</strong> {blog.blogCategory.name}
          </p>
        )}
        <p className="text-gray-700 mb-4">
          <strong>Description:</strong> {blog.description}
        </p>
        <div className="text-gray-800 whitespace-pre-wrap mb-4">
          <strong>Content:</strong>
          <div className="mt-1 p-3 bg-gray-50 rounded border">
            {blog.content}
          </div>
        </div>

        {/* Additional Images */}
        {blog.images?.length > 0 && (
          <div className="mt-4">
            <h4 className="font-semibold text-gray-700 mb-2">
              Additional Images:
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {blog.images.map((img) => (
                <img
                  key={img.id}
                  src={img.url}
                  alt={img.altText || "Blog Image"}
                  className="w-full h-32 object-cover rounded"
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ViewBlogModal;
