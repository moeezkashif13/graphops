import { configureStore } from "@reduxjs/toolkit";
import { crmApi } from "./apiSlice";
import { eli5Slice } from "./eli5Slice";

export const store = configureStore({
  reducer: {
    [crmApi.reducerPath]: crmApi.reducer,
    [eli5Slice.name]: eli5Slice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(crmApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
