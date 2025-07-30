import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slices/userSlice";
import categoryReducer from "./slices/categorySlice";
import productReducer from "./slices/productSlice";
import usersReducer from "./slices/usersSlice";
import orderReducer from "./slices/orderSlice";

const store = configureStore({
  reducer: {
    user: userReducer,
    category: categoryReducer,
    products: productReducer,
    users: usersReducer,
    orders: orderReducer,
  },
});

export default store;
