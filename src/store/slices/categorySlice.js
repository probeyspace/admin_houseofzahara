import { createSlice } from "@reduxjs/toolkit";

const categorySlice = createSlice({
  name: "category",
  initialState: null,
  reducers: {
    allCategory: (state, action) => {
      return action.payload;
    },
  },
});

export const { allCategory } = categorySlice.actions;

export default categorySlice.reducer;
