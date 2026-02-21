import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  theme: "light",
  isSidebarOpen: false,
  modal: {
    isOpen: false,
    type: null,
    data: null,
  },
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.theme = state.theme === "light" ? "dark" : "light";
    },
    setSidebarOpen: (state, action) => {
      state.isSidebarOpen = action.payload;
    },
    openModal: (state, action) => {
      state.modal.isOpen = true;
      state.modal.type = action.payload.type;
      state.modal.data = action.payload.data;
    },
    closeModal: (state) => {
      state.modal.isOpen = false;
      state.modal.type = null;
      state.modal.data = null;
    },
  },
});

export const { toggleTheme, setSidebarOpen, openModal, closeModal } =
  uiSlice.actions;
export default uiSlice.reducer;
