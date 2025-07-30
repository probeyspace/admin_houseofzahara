import React, { useState } from "react";
import {
  FiMenu,
  FiSearch,
  FiBell,
  FiSettings,
  FiUser,
  FiChevronDown,
} from "react-icons/fi";
import { logoutUser } from "../services/auth";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { removeUser } from "../store/slices/userSlice";

const Navbar = ({ toggleSidebar }) => {
  return (
    <div className="flex justify-between items-center bg-white p-4 shadow-md">
      <div className="flex items-center gap-4">
        {/* Mobile Menu Button */}
        <FiMenu
          className="text-gray-700 text-2xl cursor-pointer md:hidden"
          onClick={toggleSidebar}
        />

        {/* Search Bar */}
        {/* <div className="relative">
          <FiSearch className="text-gray-500 absolute left-2 top-2" />
          <input
            type="text"
            placeholder="Search..."
            className="pl-8 pr-2 py-1 border border-gray-300 rounded-md outline-none w-36 sm:w-60"
          />
        </div> */}
      </div>

      <div className="flex items-center gap-6">
        {/* <FiBell className="text-gray-600 text-xl cursor-pointer hover:text-primary" /> */}
        {/* <FiSettings className="text-gray-600 text-xl cursor-pointer hover:text-primary" /> */}
        <UserDropdown />
      </div>
    </div>
  );
};

const UserDropdown = () => {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);
  const handleLogout = async () => {
    const bool = await logoutUser();
    if (bool) {
      dispatch(removeUser());
      toast.success("Logout Successful");
      navigate("/login");
    } else {
      toast.error("Logout Failed");
    }
  };

  return (
    <div className="relative">
      <div
        className="flex items-center gap-2 cursor-pointer mx-4"
        onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
      >
        <FiUser className="text-gray-600 text-xl hover:text-primary" />
        <span className="text-gray-700 hidden sm:inline hover:text-primary">
          {user?.name || "User"}
        </span>
        <FiChevronDown />
      </div>

      {/* Profile Dropdown */}
      {profileDropdownOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-md z-50">
          <ul className="py-2">
            {/* <li className="px-4 py-2 hover:text-primary cursor-pointer">
              My Account
            </li> */}
            {/* <li className="px-4 py-2 hover:text-primary cursor-pointer">
              Settings
            </li> */}
            {/* <li className="px-4 py-2 hover:text-primary cursor-pointer">
              Support
            </li>
            <li className="px-4 py-2 hover:text-primary cursor-pointer">
              Lock Screen
            </li> */}
            <li
              className="px-4 py-2 hover:text-primary cursor-pointer"
              onClick={handleLogout}
            >
              Logout
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default Navbar;
