import { useState, useEffect } from "react";
import { FaCloudUploadAlt } from "react-icons/fa";
import SvgSpinner from "../../common/SvgSpinner";
import api from "../../Api/api";
import { toast } from "react-toastify";

const EditCustomerVideoModal = ({ show, onClose, onSuccess, videoData }) => {
  const [title, setTitle] = useState("");
  const [videoFile, setVideoFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (videoData) {
      setTitle(videoData.title || videoData.name || "");
      setVideoUrl(videoData.imageUrl || "");
      setPreview(videoData.imageUrl || "");
    }
  }, [videoData]);

  if (!show || !videoData) return null;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVideoFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("title", title || "Customer Video");
    formData.append("name", title || "Customer Video");

    if (videoFile) {
      formData.append("imageUrl", videoFile);
    } else if (videoUrl) {
      formData.append("videoUrl", videoUrl);
    }

    try {
      await api.put(`/customer-videos/${videoData._id}`, formData);
      toast.success("Video updated successfully!");
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error("Error updating video:", error);
      toast.error("Error updating video");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white max-w-sm w-full p-6 rounded-2xl shadow-xl relative border border-[#E5DFD3]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-black text-2xl font-light leading-none"
        >
          &times;
        </button>

        <h2 className="text-lg font-serif text-[#1C1C1C] mb-4 text-center">
          Edit Customer Video
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-gray-600 font-medium mb-1">
              Title / Caption (Optional)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-black transition"
            />
          </div>

          <div>
            <label className="block text-gray-600 font-medium mb-1">
              Video URL
            </label>
            <input
              type="text"
              value={videoUrl}
              onChange={(e) => {
                setVideoUrl(e.target.value);
                setPreview(e.target.value);
              }}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-black transition font-mono text-[11px]"
            />
          </div>

          <div className="text-center text-gray-400 font-medium text-[10px] uppercase tracking-wider">
            OR
          </div>

          <div>
            <label className="cursor-pointer bg-[#F7F5F0] hover:bg-[#EFECE6] border border-dashed border-gray-300 rounded-lg p-3 flex flex-col items-center justify-center gap-1.5 transition">
              <FaCloudUploadAlt className="text-gray-500 text-lg" />
              <span className="text-gray-700 font-medium">Replace Video File (.mp4, .webm)</span>
              <input
                type="file"
                accept="video/*,image/gif"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          </div>

          {preview && (
            <div className="pt-2 text-center">
              <video
                src={preview}
                autoPlay
                loop
                muted
                playsInline
                className="w-24 h-36 object-cover rounded-lg mx-auto border border-gray-200 shadow-sm"
              />
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1C1C1C] hover:bg-[#333] text-white py-2.5 rounded-full font-semibold uppercase tracking-wider text-[11px] transition shadow-sm"
            >
              {!loading ? "Update Video" : <SvgSpinner />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCustomerVideoModal;
