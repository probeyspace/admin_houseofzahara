import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FiMenu, FiChevronDown, FiChevronUp } from "react-icons/fi";
import { MdArticle, MdDashboard, MdLock, MdSearch } from "react-icons/md";
import { BsEyeglasses } from "react-icons/bs";
import { FaUsers, FaUserPlus, FaPlus, FaCommentDots } from "react-icons/fa";
import { BiCategory } from "react-icons/bi";
import { TbCategoryPlus } from "react-icons/tb";
// import logo from "../assets/logo.png";
import { FaStore } from "react-icons/fa";
const Sidebar = ({ mobileSidebarOpen, toggleSidebar }) => {
  const [dropdownsOpen, setDropdownsOpen] = useState({});
  const toggleDropdown = (text) => {
    setDropdownsOpen((prev) => ({
      ...prev,
      [text]: !prev[text],
    }));
  };

  const menuItems = [
    { to: "/", icon: <MdDashboard />, text: "Dashboard" },
    {
      to: "/products",
      text: "Products",
      icon: <BsEyeglasses />,
    },
    {
      icon: <BiCategory />,
      text: "Master Categories",
      to: "/master",
    },
    {
      icon: <BiCategory />,
      text: "Categories",
      to: "/category",
    },
    {
      icon: <BiCategory />,
      text: "Subcategories",
      to: "/subcategory",
    },

    {
      to: "/users",
      icon: <FaUsers />,
      text: "Users",
    },
    { to: "/orders", icon: <MdDashboard />, text: "Orders" },
    {
      icon: <BiCategory />,
      text: "Coupons",
      to: "/coupons",
    },
    {
      icon: <BiCategory />,
      text: "Banners",
      to: "/banners",
    },

    {
      icon: <BiCategory />,
      text: "Testimonials",
      to: "/testimonials",
    },
    {
      to: "/reviews",
      icon: <FaCommentDots />,
      text: "Reviews",
    },
    {
      to: "/blogs",
      icon: <MdArticle />,
      text: "Blogs",
    },
    {
      to: "/brands",
      icon: <BiCategory />,
      text: "Brands",
    },
    {
      to: "/contacts",
      icon: <MdDashboard />,
      text: "Contacts",
    },
      {
        to: "/subscribers",
        icon: <MdDashboard />,
        text: "Subscribers",
      },
      {
        to: "/pre-bookings",
        icon: <MdDashboard />,
        text: "Pre-bookings",
      },
    ];

  return (
    <div
      className={`fixed scrollbar-hidden md:relative w-64 bg-primary text-dark text-md transition-all duration-300 z-50 
      h-screen overflow-y-auto ${
        mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
      } md:translate-x-0`}
    >
      <div className="flex items-center justify-between p-4">
        {/* <img src={logo} alt="" /> */}
        <h2 className="text-2xl font-bold">Heavenly Beauty</h2>
        <FiMenu
          className="cursor-pointer text-xl md:hidden"
          onClick={toggleSidebar}
        />
      </div>

      <nav className="flex flex-col gap-4 p-4">
        {menuItems.map((item) =>
          item.subItems ? (
            <div key={item.text}>
              <div
                className="flex items-center gap-3 p-2 cursor-pointer hover:transform hover:scale-105 transition ease-in-out duration-300 rounded-md"
                onClick={() => toggleDropdown(item.text)}
              >
                {item.icon}
                <span>{item.text}</span>
                {dropdownsOpen[item.text] ? <FiChevronUp /> : <FiChevronDown />}
              </div>

              <div
                className={`ml-6 flex flex-col overflow-hidden hover:transform hover:scale-105 transition ease-in-out text-sm duration-300 ${
                  dropdownsOpen[item.text]
                    ? "max-h-[500px] opacity-100"
                    : "max-h-0 opacity-0"
                }`}
              >
                {item.subItems.map((sub) => (
                  <NavItem
                    key={sub.to}
                    {...sub}
                    toggleSidebar={toggleSidebar}
                  />
                ))}
              </div>
            </div>
          ) : (
            <NavItem key={item.to} {...item} toggleSidebar={toggleSidebar} />
          )
        )}
      </nav>
    </div>
  );
};

const NavItem = ({ to, icon, text, toggleSidebar }) => (
  <Link
    to={to}
    onClick={toggleSidebar}
    className="flex items-center gap-3 p-2 hover:transform hover:scale-105 transition ease-in-out duration-300 cursor-pointer rounded-md"
  >
    {icon}
    <span>{text}</span>
  </Link>
);

export default Sidebar;
