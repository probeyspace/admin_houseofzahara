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
      const index = state.findIndex((p) => p._id === action.payload._id);
      if (index !== -1) {
        state[index] = action.payload;
      }
    },
    addVariant: (state, action) => {
      const index = state.findIndex((p) => p._id === action.payload.productId);
      if (index !== -1) {
        state[index].variants.push(action.payload);
      }
    },
    editVariant: (state, action) => {
      const index = state.findIndex((p) => p._id === action.payload.productId);
      if (index !== -1) {
        const variantIndex = state[index].variants.findIndex(
          (v) => v._id === action.payload._id
        );
        if (variantIndex !== -1) {
          state[index].variants[variantIndex] = action.payload;
        }
      }
    },
    deleteVariant: (state, action) => {
      const { productId, id } = action.payload;
      const index = state.findIndex((p) => p._id === productId);
      if (index !== -1) {
        state[index].variants = state[index].variants.filter(
          (v) => v._id !== id
        );
      }
    },
    verifyProduct: (state, action) => {
      const index = state.findIndex((p) => p._id === action.payload._id);
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
  addVariant,
  editVariant,
  deleteVariant,
} = productSlice.actions;

export default productSlice.reducer;
