import { Route, Routes } from "react-router-dom";
import "./App.css";
import LoginPage from "./Pages/LoginPage";
import { useCurrentUser } from "./Hooks/useCurrentUser";
import Layout from "./Layout/Layout";
import ProductPage from "./Pages/ProductPage";
import UsersList from "./components/Users/UsersList";
import DashboardPage from "./Pages/DashboardPage";
import CategoryList from "./components/Category/CategoryList";
import CouponsList from "./components/Coupons/CouponsList";
import OrderList from "./components/Orders/OrdersList";
import BannerList from "./components/Banners/BannerList";
import TestimonialList from "./components/Testimonials/TestimonialList";
import ContactList from "./components/Contact/ContactList";
import ReviewsList from "./components/Reviews/ReviewsList";
import BrandPage from "./Pages/BrandPage";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ProtectedRoute from "./components/ProtectedRoutes/ProtectedRoute";
import MasterCategoryList from "./components/MasterCats/MasterCategoryList";
import SubCategoryList from "./components/SubCategory/SubCategoryList";
import SubscriberList from "./components/Subscribers/SubscriberList";
import BlogList from "./components/Blogs/BlogList";
import BlogCategoryList from "./components/Blogs/BlogCategoryList";
import PreBookingList from "./components/PreBookings/PreBookingList";
import WalletConfig from "./Pages/WalletConfig";
import WalletManagement from "./Pages/WalletManagement";
import SeoSettings from "./Pages/SeoSettings";
// import Articles from "./components/Articles/Articles";
// import SearchedLogs from "./components/Searched/SearchedLogs";
function App() {
  useCurrentUser();
  return (
    <>
      <Routes>
        {/* PUBLIC ROUTE */}
        <Route path="/login" element={<LoginPage />} />
        {/* ADMIN PROTECTED ROUTES */}
        <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
          <Route element={<Layout />}>
            <Route index element={<DashboardPage />} />
            <Route path="products" element={<ProductPage />} />
            <Route path="master" element={<MasterCategoryList />} />
            <Route path="category" element={<CategoryList />} />
            <Route path="subcategory" element={<SubCategoryList />} />
            <Route path="users" element={<UsersList />} />
            <Route path="orders" element={<OrderList />} />
            <Route path="coupons" element={<CouponsList />} />
            <Route path="banners" element={<BannerList />} />
            <Route path="testimonials" element={<TestimonialList />} />
            <Route path="contacts" element={<ContactList />} />
            <Route path="brands" element={<BrandPage />} />
            <Route path="reviews" element={<ReviewsList />} />
            <Route path="subscribers" element={<SubscriberList />} />
            <Route path="pre-bookings" element={<PreBookingList />} />
            <Route path="blogs" element={<BlogList />} />
            <Route path="blog-categories" element={<BlogCategoryList />} />
            <Route path="wallet-config" element={<WalletConfig />} />
            <Route path="wallet-management" element={<WalletManagement />} />
            <Route path="seo-settings" element={<SeoSettings />} />

            {/* <Route path="searched" element={<SearchedLogs />} />  */}
            {/* <Route path="articles" element={<Articles />} /> */}
          </Route>
        </Route>
      </Routes>

      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={true}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </>
  );
}

export default App;
