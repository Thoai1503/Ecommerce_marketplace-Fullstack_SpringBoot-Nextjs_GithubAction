"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { SellerAuthProvider } from "./SellerAuthContext";

const SellerProvider = ({
  role,
  user_id,
  children,
}: {
  role: "buyer" | "seller" | "both" | undefined;
  user_id: number | undefined;
  children: React.ReactNode;
}) => {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <SellerAuthProvider role={role} user_id={user_id}>
        {children}
      </SellerAuthProvider>
    </QueryClientProvider>
  );
};

export default SellerProvider;
