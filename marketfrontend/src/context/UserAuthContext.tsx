"use client";
import {
  createContext,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";

interface UserAuthContextType {
  roles: "buyer" | "seller" | null;
  setRoles: React.Dispatch<React.SetStateAction<"buyer" | "seller" | null>>;
}

const UserAuthContext = createContext<UserAuthContextType | undefined>(
  undefined,
);

export const UserAuthProvider = ({
  role,
  children,
}: {
  role: string | undefined;
  children: React.ReactNode;
}) => {
  const [roles, setRoles] = useState<"buyer" | "seller" | null>(null);

  useEffect(() => {
    // Validate and set role when prop changes
    if (role === "buyer") {
      setRoles("buyer");
    } else if (role === "seller") {
      setRoles("seller");
    } else {
      setRoles(null);
    }
  }, [role]);

  return (
    <UserAuthContext.Provider value={{ roles, setRoles }}>
      {children}
    </UserAuthContext.Provider>
  );
};

export const useUserAuth = () => {
  const context = useContext(UserAuthContext);
  if (context === undefined) {
    throw new Error("useUserAuth must be used within a UserAuthProvider");
  }
  return context;
};
