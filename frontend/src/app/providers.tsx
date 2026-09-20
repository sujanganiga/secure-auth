"use client";

import { Provider } from "react-redux";
import { store } from "@/store/store";
import AuthInitializer from "@/components/AuthInitializer";
import InactivityHandler from "@/components/InactivityHandler";

export default function Providers({ children ,}: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AuthInitializer/>
      <InactivityHandler/>
      {children}
    </Provider>
  );
}