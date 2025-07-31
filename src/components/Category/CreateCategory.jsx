import { useState } from "react";
import { FaCloudUploadAlt } from "react-icons/fa";
import { createCategory } from "../../services/category";
import SvgSpinner from "../../common/SvgSpinner";
import { toast } from "react-toastify";
import { allCategory } from "../../store/slices/categorySlice";
import { useDispatch, useSelector } from "react-redux";

const CreateCategory = () => {
  const [categoryName, setCategoryName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const categories = useSelector((store) => store.category);
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
    if (!categoryName || !description) {
      toast.error("Category name and description are required");
      return;
    }
    const formData = new FormData();
    formData.append("name", categoryName);
    formData.append("description", description);
    if (image) formData.append("image", image);
    try {
      const newCategory = await createCategory(formData);
      toast.success("Category created successfully");
      setCategoryName("");
      setDescription("");
      setImage(null);
      setPreview(null);
      dispatch(allCategory([...categories, newCategory]));
    } catch (error) {
      console.error("Error creating category:", error);
      toast.error(
        error?.response?.data?.message || "Failed to create category."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Create Category</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Category Name */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">
            Category Name
          </label>
          <input
            type="text"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded-md focus:ring focus:ring-blue-300"
            placeholder="Enter category name"
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
            placeholder="Enter category description"
            rows="4"
          ></textarea>
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">
            Upload Image (Optional)
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
            className=" bg-primary hover:scale-105 transition duration-300 text-dark px-4 py-2 rounded-md font-medium cursor-pointer"
          >
            {!loading ? (
              "Create Category"
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

export default CreateCategory;
