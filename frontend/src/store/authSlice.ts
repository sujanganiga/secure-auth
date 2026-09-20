import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface User {
  username: string;
}

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
}

const initialState: AuthState = {
  token: null,
  refreshToken: null,
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
        refreshToken: string;
        username: string;
      }>,
    ) => {
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
      state.user = {
        username: action.payload.username,
      };
      state.isAuthenticated = true;

      if (typeof window !== "undefined") {
        localStorage.setItem("token", action.payload.token);

        localStorage.setItem("refreshToken", action.payload.refreshToken);

        localStorage.setItem("username", action.payload.username);
      }
    },

    logout: (state) => {
        state.token = null;
        state.refreshToken = null;
        state.user = null;
        state.isAuthenticated = false;

        if (typeof window !== "undefined") {
            localStorage.removeItem("token");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("username");
        }
    },

    restoreAuth: (
          state,
          action: PayloadAction<{
              token: string;
              refreshToken: string;
              username: string;
          }>,
      ) => {
          state.token = action.payload.token;
          state.refreshToken = action.payload.refreshToken;

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
