import storage from "redux-persist/lib/storage";

export const persistConfig = {
  key: "360tours",
  storage,
  whitelist: ["auth"],
};
