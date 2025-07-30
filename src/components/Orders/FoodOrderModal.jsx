import { useState } from "react";
import dish from "../../assets/auth1.jpg";
const FoodOrderModal = ({ isOpen, onClose, foodSenders }) => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    date: "",
    time: "",
    phone: "",
    location: "",
    sender: "", // new field
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "sender") {
      const selectedSender = foodSenders.find(
        (sender) => sender.name === value
      );
      if (selectedSender) {
        setForm((prev) => ({
          ...prev,
          sender: value,
          name: selectedSender.name,
          email: selectedSender.email,
          phone: selectedSender.phone,
        }));
      } else {
        setForm((prev) => ({ ...prev, sender: value }));
      }
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    console.log("Uploaded:", file);
  };
  const handleAssign = () => {
    console.log(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg w-full max-w-4xl p-6 relative overflow-y-auto max-h-[95vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-4 text-xl font-bold text-gray-600 hover:text-red-500"
        >
          &times;
        </button>
        <h3 className="text-center py-3 text-2xl font-bold">Assign Order</h3>
        <div className="flex flex-col md:flex-row gap-15">
          {/* Upload Section */}
          <div className="flex flex-col items-center">
            <label className="relative cursor-pointer w-40 h-40 md:w-64 md:h-64 border border-gray-300 rounded-full overflow-hidden flex items-center justify-center">
              <img
                src={dish}
                alt="Upload"
                className="object-cover w-full h-full opacity-30"
              />
              <div className="absolute text-center">
                <div className="text-4xl">☁️⬆️</div>
                <p className="text-lg font-semibold">Upload Image</p>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </label>
          </div>

          {/* Form Section */}
          <form className="w-full md:w-1/2 grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="col-span-2 font-semibold text-lg">
              Select Food Sender
            </div>
            <select
              name="sender"
              value={form.sender}
              onChange={handleChange}
              className="col-span-2 border p-2 rounded bg-gray-100"
            >
              <option value="">Choose sender</option>
              {foodSenders?.map((sender, i) => (
                <option key={i} value={sender.name}>
                  {sender.name} ({sender.type})
                </option>
              ))}
            </select>
            <div className="col-span-2 font-semibold text-lg">Name</div>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="col-span-2 border p-2 rounded bg-gray-100"
              placeholder="Enter your name"
            />

            <div className="col-span-2 font-semibold text-lg">Email ID</div>
            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              className="col-span-2 border p-2 rounded bg-gray-100"
              placeholder="Enter your email"
            />

            <div className="font-semibold text-lg">Date</div>
            <div className="font-semibold text-lg">Time</div>
            <select
              name="date"
              value={form.date}
              onChange={handleChange}
              className="border p-2 rounded bg-gray-100"
            >
              <option value="">Select Date</option>
              <option value="2025-06-10">June 10, 2025</option>
              <option value="2025-06-11">June 11, 2025</option>
            </select>
            <select
              name="time"
              value={form.time}
              onChange={handleChange}
              className="border p-2 rounded bg-gray-100"
            >
              <option value="">Select Time</option>
              <option value="10:00 AM">10:00 AM</option>
              <option value="12:00 PM">12:00 PM</option>
            </select>

            <div className="col-span-2 font-semibold text-lg">Phone No.</div>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className="col-span-2 border p-2 rounded bg-gray-100"
              placeholder="+91 XXXXXXXXXX"
            />

            <div className="col-span-2 font-semibold text-lg">
              Delivery Location
            </div>
            <textarea
              name="location"
              value={form.location}
              onChange={handleChange}
              rows="4"
              className="col-span-2 border p-2 rounded bg-gray-100"
              placeholder="Enter full delivery address"
            />
          </form>
        </div>
        <div className="flex justify-center">
          <button
            onClick={handleAssign}
            className="mt-4 w-50 bg-primary text-white py-2 px-4 rounded"
          >
            Assign
          </button>
        </div>
      </div>
    </div>
  );
};

export default FoodOrderModal;
