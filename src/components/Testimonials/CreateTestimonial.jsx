import { useState } from "react";
import { FaCloudUploadAlt } from "react-icons/fa";
import SvgSpinner from "../../common/SvgSpinner";
import api from "../../Api/api";
import { toast } from "react-toastify";

const CreateTestimonial = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [city, setCity] = useState("");
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file)); // Show preview before upload
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    if (!name || !description || !city || rating === 0 || !image) {
      toast.warn("Name, description, city, image and rating are required");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("city", city);
    formData.append("rating", rating);
    if (image) formData.append("image", image);

    try {
      const response = await api.post("/testimonials", formData);
      toast.success("Testimonial created successfully");
      setName("");
      setDescription("");
      setCity("");
      setRating(0);
      setImage(null);
      setPreview(null);
      setLoading(false);
    } catch (error) {
      console.error("Error:", error);
      setLoading(false);
      toast.error("Error creating testimonial");
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        Create Testimonial
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded-md focus:ring focus:ring-blue-300"
            placeholder="Enter name"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:ring focus:ring-blue-300"
            placeholder="Enter testimonial description"
            rows="4"
          ></textarea>
        </div>

        {/* City */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">City</label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded-md focus:ring focus:ring-blue-300"
            placeholder="Enter city"
          />
        </div>

        {/* Rating */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">Rating</label>
          <select
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
            required
            className="w-full px-4 py-2 border rounded-md focus:ring focus:ring-blue-300"
          >
            <option value={0}>Select rating</option>
            <option value={1}>1</option>
            <option value={2}>2</option>
            <option value={3}>3</option>
            <option value={4}>4</option>
            <option value={5}>5</option>
          </select>
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">
            Upload Image
          </label>
          <div className="flex items-center gap-4">
            <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-md flex items-center gap-2">
              <FaCloudUploadAlt />
              Upload Image
              <input
                type="file"
                className="hidden"
                onChange={handleImageChange}
              />
            </label>
            {preview && (
              <img
                src={preview}
                alt="Preview"
                className="w-16 h-16 rounded-md object-cover border"
              />
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            className="bg-primary hover:scale-105 transition duration-300 text-white px-4 py-2 rounded-md font-medium cursor-pointer"
          >
            {!loading ? (
              "Create Testimonial"
            ) : (
              <>
                <SvgSpinner />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTestimonial;
