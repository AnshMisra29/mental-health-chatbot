import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";
import { queryClient } from "../../main";

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

// Async thunk for deleting a chat message
export const deleteChatMessage = createAsyncThunk(
  "chat/deleteMessage",
  async (chatId, { rejectWithValue }) => {
    try {
      await api.delete(`/chat/history/${chatId}`);
      return chatId;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || "Failed to delete message");
    }
  }
);

// Async thunk for deleting multiple chat messages
export const deleteBulkMessages = createAsyncThunk(
  "chat/deleteBulk",
  async (chatIds, { rejectWithValue }) => {
    try {
      await api.post("/chat/history/delete-bulk", { chat_ids: chatIds });
      return chatIds;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || "Failed to delete messages");
    }
  }
);

const initialState = {
  messages: [],
  isTyping: false,
  error: null,
  failedMessage: null,   // stores the message text that failed so UI can offer retry
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
    },
    clearFailedMessage: (state) => {
      state.failedMessage = null;
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
        const { id, response, emotion, risk_level, alert_id, is_crisis } = action.payload;
        
        // Update the AI message with real data and ID
        const aiMessage = {
          id: `hist-${id}-a`, // Map to the new selection logic instantly
          text: response,
          sender: "ai",
          emotion,
          riskLevel: risk_level,
          alertId: alert_id,
          isCrisis: is_crisis,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
        state.messages.push(aiMessage);

        // Also update the preceding user message ID so it's instantly deletable
        if (state.messages.length >= 2) {
          const userMsgIndex = state.messages.length - 2;
          if (state.messages[userMsgIndex].sender === "user" && state.messages[userMsgIndex].id.startsWith("u-")) {
            state.messages[userMsgIndex].id = `hist-${id}-u`;
          }
        }

        // Invalidate queries for instant dashboard sync
        if (queryClient) {
          queryClient.invalidateQueries({ queryKey: ["chatHistory"] });
          queryClient.invalidateQueries({ queryKey: ["userSummary"] });
          queryClient.invalidateQueries({ queryKey: ["moodLogs"] });
        }
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.isTyping = false;
        state.error = action.payload;
        // Keep failedMessage set by the thunk arg so the UI can offer a retry
        state.failedMessage = action.meta.arg.message;
      })
      // Fetch history cases
      .addCase(fetchChatHistory.pending, (state) => {
        state.historyLoading = true;
        state.historyError = null;
      })
      .addCase(fetchChatHistory.fulfilled, (state, action) => {
        state.historyLoading = false;
        state.totalMessages = action.payload.total;
        
        // Backend returns DESC (latest first). We want ASC (oldest first) in the UI.
        const historyData = [...action.payload.history].reverse();
        
        const allMessages = [];
        historyData.forEach((chat) => {
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
            alertId: chat.alert_id,
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
      })
      // Delete message cases
      .addCase(deleteChatMessage.fulfilled, (state, action) => {
        const deletedId = action.payload;
        // The UI maps user/ai pairs, but they share the same base hist-{id}-u and hist-{id}-a
        state.messages = state.messages.filter(msg => !msg.id.includes(`hist-${deletedId}-`));

        // Sync Dashboard in background (even if count doesn't change, other stats might)
        if (queryClient) {
          queryClient.invalidateQueries({ queryKey: ["chatHistory"] });
          queryClient.invalidateQueries({ queryKey: ["userSummary"] });
        }
      })
      .addCase(deleteBulkMessages.fulfilled, (state, action) => {
        const deletedIds = action.payload;
        state.messages = state.messages.filter(msg => {
          const match = msg.id.match(/hist-(\d+)-/);
          if (match) {
            const id = parseInt(match[1]);
            return !deletedIds.includes(id);
          }
          return true;
        });

        // Sync Dashboard in background
        if (queryClient) {
          queryClient.invalidateQueries({ queryKey: ["chatHistory"] });
          queryClient.invalidateQueries({ queryKey: ["userSummary"] });
        }
      });
  },
});

export const { addMessage, setTyping, clearChat, clearError, clearFailedMessage } = chatSlice.actions;
export default chatSlice.reducer;
