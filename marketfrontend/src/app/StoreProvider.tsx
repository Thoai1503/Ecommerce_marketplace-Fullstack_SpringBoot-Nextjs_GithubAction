"use client";
import { useEffect, useRef } from "react";
import { Provider } from "react-redux";
import { makeStore, AppStore } from "../lib/store";
import axios from "axios";

export default function StoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const storeRef = useRef<AppStore>(undefined);
  if (!storeRef.current) {
    // Create the store instance the first time this renders
    storeRef.current = makeStore();
  }

  useEffect(() => {
    axios
      .get(
        "https://ezonex.duckdns.org/users/me",
        { withCredentials: true }, // 🔥 BẮT BUỘC
      )
      .then((res) => console.log("Cookie respone: " + res.data));
  }, []);
  return <Provider store={storeRef.current}>{children}</Provider>;
}
