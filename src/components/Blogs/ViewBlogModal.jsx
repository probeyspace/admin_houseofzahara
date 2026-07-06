const ViewBlogModal = ({ isOpen, onClose, blog }) => {
  if (!isOpen || !blog) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-black/30 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-[800px] max-w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">{blog.title}</h2>
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

        {/* Blog Image */}
        {blog.imageUrl && (
          <div className="mb-4">
            <img
              src={blog.imageUrl}
              alt={blog.title}
              className="w-full h-64 object-cover rounded-lg"
            />
          </div>
        )}

        {/* Blog Meta Info */}
        <div className="mb-4 text-sm text-gray-600 space-y-1">
          {blog.author && (
            <p>
              <span className="font-semibold">Author:</span> {blog.author}
            </p>
          )}
          {blog.readingTime && (
            <p>
              <span className="font-semibold">Reading Time:</span>{" "}
              {blog.readingTime} min
            </p>
          )}
          {blog.metaTitle && (
            <p>
              <span className="font-semibold">Meta Title:</span> {blog.metaTitle}
            </p>
          )}
          {blog.metaDetails && (
            <p>
              <span className="font-semibold">Meta Details:</span> {blog.metaDetails}
            </p>
          )}
          <p>
            <span className="font-semibold">Status:</span>{" "}
            <span className={`px-2 py-0.5 text-[11px] font-semibold rounded capitalize ${
              blog.status === "draft" ? "bg-gray-100 text-gray-800 border border-gray-200" : "bg-green-100 text-green-800"
            }`}>
              {blog.status || "Published"}
            </span>
          </p>
          <p>
            <span className="font-semibold">Published:</span>{" "}
            {formatDate(blog.publishDate || blog.createdAt)}
            {new Date(blog.publishDate || blog.createdAt) > new Date() && (
              <span className="ml-2 px-2 py-0.5 text-[11px] font-semibold rounded bg-amber-100 text-amber-800">
                Scheduled
              </span>
            )}
          </p>
          {blog.updatedAt && blog.updatedAt !== (blog.publishDate || blog.createdAt) && (
            <p>
              <span className="font-semibold">Last Updated:</span>{" "}
              {formatDate(blog.updatedAt)}
            </p>
          )}
        </div>

        {/* Blog Content */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Content</h3>
          <div
            className="text-gray-600 bg-gray-50 p-4 rounded prose max-w-none"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />
        </div>

        {/* Close Button */}
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-400 text-dark px-6 py-2 rounded cursor-pointer hover:bg-gray-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewBlogModal;
