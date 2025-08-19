import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import useUsers from "../Hooks/useUsers";
import useProducts from "../Hooks/useProducts";
import { useCategory } from "../Hooks/useCategory";
import { useMasterCategory } from "../Hooks/useMasterCategory";
import { useSubCategory } from "../Hooks/useSubCategory";
import useOrders from "../Hooks/useOrders";
const Layout = () => {
  useUsers();
  useCategory();
  useProducts();
  useMasterCategory();
  useSubCategory();
  useOrders();

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const toggleSidebar = () => {
    setMobileSidebarOpen((prev) => !prev);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar (Fixed on large screens, togglable on mobile) */}
      <Sidebar
        mobileSidebarOpen={mobileSidebarOpen}
        toggleSidebar={toggleSidebar}
      />

      <div className="flex-1 flex flex-col">
        {/* Fixed Navbar */}
        <Navbar toggleSidebar={toggleSidebar} />

        {/* Scrollable content area */}
        <div className="p-5 overflow-auto bg-[#EAF1F3] h-screen">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;
