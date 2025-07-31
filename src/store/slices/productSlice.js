import { createSlice } from "@reduxjs/toolkit";

const productSlice = createSlice({
  name: "products",
  initialState: [],
  reducers: {
    setProduct: (state, action) => {
      return action.payload;
    },
    addProductData: (state, action) => {
      state.push(action.payload);
    },
    deleteProduct: (state, action) => {
      return state.filter((p) => p._id !== action.payload);
    },
    updateProductData: (state, action) => {
      const index = state.findIndex((p) => p._id === action.payload.id);
      if (index !== -1) {
        state[index] = action.payload;
      }
    },
    verifyProduct: (state, action) => {
      const index = state.findIndex((p) => p._id === action.payload.id);
      if (index !== -1) {
        state[index].isVerified = action.payload.isVerified;
      }
    },
  },
});

export const {
  setProduct,
  addProductData,
  deleteProduct,
  updateProductData,
  verifyProduct,
} = productSlice.actions;

export default productSlice.reducer;
