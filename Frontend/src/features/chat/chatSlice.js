import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  messages: [],
  isTyping: false,
  activeChatId: null,
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setMessages: (state, action) => {
      state.messages = action.payload;
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    setTyping: (state, action) => {
      state.isTyping = action.payload;
    },
    setActiveChat: (state, action) => {
      state.activeChatId = action.payload;
    },
  },
});

export const { setMessages, addMessage, setTyping, setActiveChat } =
  chatSlice.actions;
export default chatSlice.reducer;
