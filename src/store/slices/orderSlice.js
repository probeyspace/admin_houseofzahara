import { createSlice } from "@reduxjs/toolkit";

const orderSlice = createSlice({
  name: "orders",
  initialState: [],
  reducers: {
    setOrders: (state, action) => {
      return action.payload;
    },

    changeStatus: (state, action) => {
      const order = state.find((order) => order.id === action.payload.id);
      if (order) {
        order.status = action.payload.status;
      }
    },
  },
});

export const { setOrders, changeStatus } = orderSlice.actions;
export default orderSlice.reducer;
