import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slices/userSlice";
import categoryReducer from "./slices/categorySlice";
import productReducer from "./slices/productSlice";
import usersReducer from "./slices/usersSlice";
import orderReducer from "./slices/orderSlice";
import masterCategoryReducer from "./slices/masterSlice";
import subCategoryReducer from "./slices/subCategorySlice";
const store = configureStore({
  reducer: {
    user: userReducer,
    category: categoryReducer,
    products: productReducer,
    users: usersReducer,
    orders: orderReducer,
    masterCategory: masterCategoryReducer,
    subCategory: subCategoryReducer,
  },
});

export default store;
