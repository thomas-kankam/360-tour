import { createSlice } from "@reduxjs/toolkit";
import { REHYDRATE } from "redux-persist";
import { USER_ROLES } from "../../constants/roles";
import {
  createEmptyAuthSessions,
  normalizeAuthRole,
  normalizePersistedAuthState,
} from "../../utils/authSessionHelpers";

const initialState = {
  sessions: createEmptyAuthSessions(),
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials(state, action) {
      const { token, user } = action.payload;
      const role = normalizeAuthRole(user?.role);
      state.sessions[role] = { token, user };
    },
    clearCredentials(state, action) {
      const role = action.payload?.role ? normalizeAuthRole(action.payload.role) : null;

      if (role) {
        state.sessions[role] = { token: null, user: null };
        return;
      }

      state.sessions = createEmptyAuthSessions();
    },
  },
  extraReducers: (builder) => {
    builder.addCase(REHYDRATE, (state, action) => {
      if (!action.payload?.auth) return state;
      return normalizePersistedAuthState(action.payload.auth);
    });
  },
});

export const { setCredentials, clearCredentials } = authSlice.actions;

const emptySession = { token: null, user: null };

export const selectSession = (state, role = USER_ROLES.TOURIST) => {
  const normalizedRole = normalizeAuthRole(role);
  return state.auth.sessions?.[normalizedRole] ?? emptySession;
};

export const selectUser = (state, role) => selectSession(state, role).user;
export const selectToken = (state, role) => selectSession(state, role).token;
export const selectIsAuthenticated = (state, role) => {
  const session = selectSession(state, role);
  return Boolean(session.token && session.user);
};
export const selectIsVerified = (state, role) =>
  selectSession(state, role).user?.isVerified !== false;
export const selectUserRole = (state, role) =>
  selectSession(state, role).user?.role ?? normalizeAuthRole(role);

export default authSlice.reducer;
