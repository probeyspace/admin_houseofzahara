import { createSlice } from "@reduxjs/toolkit";

const masterCategorySlice = createSlice({
  name: "masterCategory",
  initialState: null,
  reducers: {
    setMasterCategory: (state, action) => {
      return action.payload;
    },
    updateLocalMasterCategory: (state, action) => {
      const index = state.findIndex((c) => c._id === action.payload._id);
      if (index !== -1) {
        state[index] = action.payload;
      }
    },
    addMaster: (state, action) => {
      state.push(action.payload);
    },
    deleteMaster: (state, action) => {
      return state.filter((c) => c._id !== action.payload);
    },
    toggleMaster: (state, action) => {
      const index = state.findIndex((c) => c._id === action.payload);
      if (index !== -1) {
        state[index].isActive = !state[index].isActive;
      }
    },
  },
});

export const {
  setMasterCategory,
  updateLocalMasterCategory,
  addMaster,
  deleteMaster,
  toggleMaster,
} = masterCategorySlice.actions;

export default masterCategorySlice.reducer;
