import { createSlice } from "@reduxjs/toolkit";

const categorySlice = createSlice({
  name: "subCategory",
  initialState: null,
  reducers: {
    setSubCategory: (state, action) => {
      return action.payload;
    },
    updateLocalSubCategory: (state, action) => {
      const index = state.findIndex((c) => c._id === action.payload._id);
      if (index !== -1) {
        state[index] = action.payload;
      }
    },
    addSubCategory: (state, action) => {
      state.push(action.payload);
    },
    deleteSubCategory: (state, action) => {
      return state.filter((c) => c._id !== action.payload);
    },
  },
});

export const {
  setSubCategory,
  updateLocalSubCategory,
  addSubCategory,
  deleteSubCategory,
} = categorySlice.actions;

export default categorySlice.reducer;
