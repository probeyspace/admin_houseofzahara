import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import api from "../../Api/api";
import { toast } from "react-toastify";
import { addUser } from "../../store/slices/userSlice";

const Settings = () => {
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    kitchenName: user?.kitchenName || "",
    address: user?.address || "",
    city: user?.city || "",
    phone: user?.phone || "",
    latitude: user?.latitude || "",
    longitude: user?.longitude || "",
  });

  const detectLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setFormData((prev) => ({
          ...prev,
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        }));
        toast.success("Location detected successfully!");
      });
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async () => {
    try {
      const response = await api.put(`/vendor/${user.vendorId}`, formData);
      if (response.status === 200) {
        toast.success("Profile updated successfully!");
        setShowModal(false);
      } else {
        toast.info(response?.data?.message || "Update failed");
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Update failed");
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white shadow-md rounded-lg min-h-screen">
      <h2 className="text-2xl font-semibold text-gray-700 mb-4 border-b pb-2">
        Vendor Settings
      </h2>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex justify-center md:justify-start">
          <img
            src={user?.profileImage}
            alt="Profile"
            className="w-32 h-32 rounded-full object-cover border-2 border-gray-300"
          />
        </div>

        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700">
          <div>
            <label className="block text-sm font-medium text-gray-500">
              Name
            </label>
            <p className="text-base font-semibold">{user?.name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">
              Email
            </label>
            <p className="text-base font-semibold">{user?.email}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">
              Phone
            </label>
            <p className="text-base font-semibold">{user?.phone}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">
              Kitchen Name
            </label>
            <p className="text-base font-semibold">{user?.kitchenName}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">
              City
            </label>
            <p className="text-base font-semibold">{user?.city}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">
              Address
            </label>
            <p className="text-base font-semibold">{user?.address}</p>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-between flex-col sm:flex-row gap-4">
        <button
          onClick={() => setShowModal(true)}
          className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary/80 transition w-full sm:w-auto cursor-pointer"
        >
          Edit Profile
        </button>
      </div>

      <div className="mt-10 text-sm text-gray-600 border-t pt-4 text-center">
        <p>
          To delete your vendor account, please contact our support team or send
          a request to:{" "}
          <a
            href="mailto:goodbellygen@gmail.com"
            className="text-[#3BC0C3] font-medium underline"
          >
            goodbellygen@gmail.com
          </a>
        </p>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full relative">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">
              Edit Profile
            </h3>

            <div className="space-y-3">
              {["name", "kitchenName", "address", "city", "phone"].map(
                (field) => (
                  <div key={field}>
                    <label className="block text-sm font-medium text-gray-500">
                      {field.charAt(0).toUpperCase() + field.slice(1)}
                    </label>
                    <input
                      name={field}
                      value={formData[field]}
                      onChange={handleChange}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                )
              )}

              <div className="flex items-center gap-2">
                <button
                  onClick={detectLocation}
                  className="text-sm bg-primary text-white px-4 py-1 rounded hover:bg-primary/80 cursor-pointer"
                >
                  Detect Current Location
                </button>
                <span className="text-xs text-gray-600">
                  (Lat: {formData.latitude}, Lng: {formData.longitude})
                </span>
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-black cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/80 cursor-pointer"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
