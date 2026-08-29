import storage from "redux-persist/lib/storage";
import { createMigrate } from "redux-persist";
import { USER_ROLES } from "../constants/roles";
import { createEmptyAuthSessions } from "../utils/authSessionHelpers";

const migrations = {
  1: (state) => {
    if (!state?.auth) return state;

    const auth = state.auth;
    if (auth.sessions) return state;

    if (auth.token && auth.user) {
      const role = auth.user.role || USER_ROLES.TOURIST;
      return {
        ...state,
        auth: {
          sessions: {
            ...createEmptyAuthSessions(),
            [role]: { token: auth.token, user: auth.user },
          },
        },
      };
    }

    return {
      ...state,
      auth: { sessions: createEmptyAuthSessions() },
    };
  },
};

export const persistConfig = {
  key: "360tours",
  version: 1,
  storage,
  whitelist: ["auth"],
  migrate: createMigrate(migrations, { debug: false }),
};
