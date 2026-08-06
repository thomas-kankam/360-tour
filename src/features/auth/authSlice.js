import { createSlice } from "@reduxjs/toolkit";
import { USER_ROLES } from "../../constants/roles";

const initialState = {
  token: null,
  user: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials(state, action) {
      const { token, user } = action.payload;
      state.token = token;
      state.user = user;
    },
    clearCredentials(state) {
      state.token = null;
      state.user = null;
    },
  },
});

export const { setCredentials, clearCredentials } = authSlice.actions;

export const selectAuth = (state) => state.auth;
export const selectUser = (state) => state.auth.user;
export const selectToken = (state) => state.auth.token;
export const selectIsAuthenticated = (state) =>
  Boolean(state.auth.token && state.auth.user);
export const selectIsVerified = (state) =>
  state.auth.user?.isVerified !== false;
export const selectUserRole = (state) =>
  state.auth.user?.role ?? USER_ROLES.TOURIST;

export default authSlice.reducer;
