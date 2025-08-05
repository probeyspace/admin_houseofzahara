import { Route, Routes } from "react-router-dom";
import "./App.css";
import LoginPage from "./Pages/LoginPage";
import { useCurrentUser } from "./Hooks/useCurrentUser";
import Layout from "./Layout/Layout";
import ProductPage from "./Pages/ProductPage";
import AddCouponForm from "./components/Coupons/AddCouponForm";
import UsersList from "./components/Users/UsersList";
import DashboardPage from "./Pages/DashboardPage";
import CategoryList from "./components/Category/CategoryList";
import CouponsList from "./components/Coupons/CouponsList";
import OrderList from "./components/Orders/OrdersList";
import BannerForm from "./components/Banners/BannerForm";
import BannerList from "./components/Banners/BannerList";
import CreateTestimonial from "./components/Testimonials/CreateTestimonial";
import TestimonialList from "./components/Testimonials/TestimonialList";
import ContactList from "./components/Contact/ContactList";
import ReviewsList from "./components/Reviews/ReviewsList";
import BrandPage from "./Pages/BrandPage";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ProtectedRoute from "./components/ProtectedRoutes/ProtectedRoute";
import SubscriberList from "./components/Subscribers/SubscriberList";
import MasterCategoryList from "./components/MasterCats/MasterCategoryList";
import SubCategoryList from "./components/SubCategory/SubCategoryList";
// import BlogList from "./components/Blogs/Blogslist";
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
            <Route path="coupon" element={<CouponsList />} />
            <Route path="coupon/create" element={<AddCouponForm />} />
            <Route path="banners" element={<BannerList />} />
            <Route path="banner/create" element={<BannerForm />} />
            <Route path="testimonials" element={<TestimonialList />} />
            <Route path="testimonial/create" element={<CreateTestimonial />} />
            <Route path="contacts" element={<ContactList />} />
            <Route path="subscribers" element={<SubscriberList />} />
            <Route path="reviews" element={<ReviewsList />} />
            {/* <Route path="searched" element={<SearchedLogs />} /> */}
            {/* <Route path="blogs" element={<BlogList />} /> */}
            {/* <Route path="articles" element={<Articles />} /> */}
            <Route path="brands" element={<BrandPage />} />
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
