import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface User {
  username: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
}

const initialState: AuthState = {
  token: null,
  user: null,
  isAuthenticated: false,
  isInitialized: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (
      state,
      action: PayloadAction<{
        token: string;
        username: string;
      }>,
    ) => {
      state.token = action.payload.token;
      state.user = { username: action.payload.username };
      state.isAuthenticated = true;

      if (typeof window !== "undefined") {
        localStorage.setItem("token", action.payload.token);
        localStorage.setItem("username", action.payload.username);
      }
    },

    logout: (state) => {
      state.token = null;
      state.isAuthenticated = false;
      state.user = null;

      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("username");
      }
    },

    restoreAuth: (
      state,
      action: PayloadAction<{
        token: string;
        username: string;
      }>,
    ) => {
      state.token = action.payload.token;

      state.user = {
        username: action.payload.username,
      };

      state.isAuthenticated = true;
    },

    initializeAuth: (state) => {
        state.isInitialized = true;
    },
  },
});

export const { login, logout, restoreAuth, initializeAuth } = authSlice.actions;

export default authSlice.reducer;
