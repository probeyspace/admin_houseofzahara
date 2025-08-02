import { createSlice } from "@reduxjs/toolkit";

const categorySlice = createSlice({
  name: "category",
  initialState: null,
  reducers: {
    allCategory: (state, action) => {
      return action.payload;
    },
    updateLocalCategory: (state, action) => {
      const index = state.findIndex((c) => c._id === action.payload._id);
      if (index !== -1) {
        state[index] = action.payload;
      }
    },
  },
});

export const { allCategory, updateLocalCategory } = categorySlice.actions;

export default categorySlice.reducer;
