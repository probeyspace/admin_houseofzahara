import { useEffect, useState } from "react";
import { FaPlus, FaTrash, FaEdit } from "react-icons/fa";
import SvgSpinner from "../../common/SvgSpinner";
import api from "../../Api/api";
import { toast } from "react-toastify";
import CustomerVideoModal from "./CustomerVideoModal";
import EditCustomerVideoModal from "./EditCustomerVideoModal";

const CustomerVideoList = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const res = await api.get("/customer-videos");
      setVideos(res.data.data || []);
    } catch (err) {
      console.error("Error fetching customer videos:", err);
      toast.error("Failed to load customer videos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this video?")) return;
    try {
      await api.delete(`/customer-videos/${id}`);
      toast.success("Video deleted successfully");
      fetchVideos();
    } catch (err) {
      console.error("Error deleting video:", err);
      toast.error("Failed to delete video");
    }
  };

  const handleEditClick = (video) => {
    setSelectedVideo(video);
    setShowEditModal(true);
  };

  return (
    <div className="p-6 bg-white min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Customer Videos</h1>
          <p className="text-sm text-gray-500">
            Manage videos for "How You Wear It – Customer Videos That Say It All"
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition text-sm font-medium"
        >
          <FaPlus size={12} /> Add Video
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-48">
          <SvgSpinner />
        </div>
      ) : videos.length === 0 ? (
        <div className="p-8 text-center border rounded-lg bg-gray-50">
          <p className="text-gray-500 mb-4">No customer videos added yet.</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition text-sm font-medium"
          >
            <FaPlus size={12} /> Add First Video
          </button>
        </div>
      ) : (
        /* Linear Table View */
        <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
          <table className="w-full text-left text-sm text-gray-700">
            <thead className="bg-gray-100 text-xs font-semibold text-gray-600 uppercase border-b">
              <tr>
                <th className="py-3 px-4 w-20">Media</th>
                <th className="py-3 px-4">Title / Overlay Caption</th>
                <th className="py-3 px-4">Customer Name</th>
                <th className="py-3 px-4">Video Link</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {videos.map((vid, idx) => {
                const isVideo =
                  vid.imageUrl?.includes(".mp4") ||
                  vid.imageUrl?.includes(".webm") ||
                  vid.imageUrl?.includes("/video/");

                return (
                  <tr key={vid._id || idx} className="hover:bg-gray-50 transition">
                    {/* Media Thumbnail */}
                    <td className="py-3 px-4">
                      <div className="w-12 h-16 bg-black rounded overflow-hidden relative border">
                        {isVideo ? (
                          <video
                            src={vid.imageUrl}
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <img
                            src={vid.imageUrl}
                            alt={vid.title}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                    </td>

                    {/* Title */}
                    <td className="py-3 px-4 font-medium text-gray-900">
                      {vid.title || "—"}
                    </td>

                    {/* Name */}
                    <td className="py-3 px-4 text-gray-600">
                      {vid.name || "—"}
                    </td>

                    {/* URL */}
                    <td className="py-3 px-4">
                      <a
                        href={vid.imageUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:underline max-w-xs truncate block font-mono text-xs"
                      >
                        {vid.imageUrl}
                      </a>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => handleEditClick(vid)}
                          className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded text-xs font-medium transition flex items-center gap-1"
                        >
                          <FaEdit size={12} /> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(vid._id)}
                          className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded text-xs font-medium transition flex items-center gap-1"
                        >
                          <FaTrash size={11} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <CustomerVideoModal
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={fetchVideos}
      />

      <EditCustomerVideoModal
        show={showEditModal}
        videoData={selectedVideo}
        onClose={() => {
          setShowEditModal(false);
          setSelectedVideo(null);
        }}
        onSuccess={fetchVideos}
      />
    </div>
  );
};

export default CustomerVideoList;
