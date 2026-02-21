import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

// Async thunk for sending a message to the backend
export const sendMessage = createAsyncThunk(
  "chat/sendMessage",
  async ({ message }, { rejectWithValue }) => {
    try {
      const response = await api.post("/chat/message", { message });
      return response.data; // { response: "...", emotion: "...", is_crisis: false }
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || "Failed to send message");
    }
  }
);

const initialState = {
  messages: [],
  isTyping: false,
  error: null,
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    setTyping: (state, action) => {
      state.isTyping = action.payload;
    },
    clearChat: (state) => {
      state.messages = [];
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendMessage.pending, (state) => {
        state.isTyping = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.isTyping = false;
        const aiMessage = {
          id: `a-${Date.now()}`,
          text: action.payload.response,
          sender: "ai",
          emotion: action.payload.emotion,
          isCrisis: action.payload.is_crisis,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
        state.messages.push(aiMessage);
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.isTyping = false;
        state.error = action.payload;
      });
  },
});

export const { addMessage, setTyping, clearChat } = chatSlice.actions;
export default chatSlice.reducer;
