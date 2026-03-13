import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

// Async thunk for sending a message to the backend
export const sendMessage = createAsyncThunk(
  "chat/sendMessage",
  async ({ message }, { rejectWithValue }) => {
    try {
      const response = await api.post("/chat/message", { message });
      return response.data; // { response: "...", emotion: "...", is_crisis: false, risk_level: "..." }
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || "Failed to send message");
    }
  }
);

// Async thunk for fetching chat history
export const fetchChatHistory = createAsyncThunk(
  "chat/fetchHistory",
  async ({ page = 1, per_page = 50 }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/chat/history?page=${page}&per_page=${per_page}`);
      return response.data; // { total, pages, current_page, per_page, history: [...] }
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || "Failed to fetch history");
    }
  }
);

const initialState = {
  messages: [],
  isTyping: false,
  error: null,
  historyLoading: false,
  historyError: null,
  totalMessages: 0,
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
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Send message cases
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
          riskLevel: action.payload.risk_level,
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
      })
      // Fetch history cases
      .addCase(fetchChatHistory.pending, (state) => {
        state.historyLoading = true;
        state.historyError = null;
      })
      .addCase(fetchChatHistory.fulfilled, (state, action) => {
        state.historyLoading = false;
        state.totalMessages = action.payload.total;
        // Populate messages from history (reverse to show oldest first)
        const historyMessages = action.payload.history.reverse().map((chat, idx) => ({
          id: `hist-${chat.id}-u`,
          text: chat.message,
          sender: "user",
          timestamp: new Date(chat.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        }));
        
        // Add AI responses after each user message
        const allMessages = [];
        action.payload.history.reverse().forEach((chat, idx) => {
          allMessages.push({
            id: `hist-${chat.id}-u`,
            text: chat.message,
            sender: "user",
            timestamp: new Date(chat.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          });
          allMessages.push({
            id: `hist-${chat.id}-a`,
            text: chat.bot_response,
            sender: "ai",
            emotion: chat.emotion,
            riskLevel: chat.risk_level,
            isCrisis: chat.is_crisis,
            timestamp: new Date(chat.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          });
        });
        
        state.messages = allMessages;
      })
      .addCase(fetchChatHistory.rejected, (state, action) => {
        state.historyLoading = false;
        state.historyError = action.payload;
      });
  },
});

export const { addMessage, setTyping, clearChat, clearError } = chatSlice.actions;
export default chatSlice.reducer;
