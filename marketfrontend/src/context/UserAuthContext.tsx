"use client";
import {
  createContext,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";

interface UserAuthContextType {
  userId: number | null;
  roles: "buyer" | "seller" | null;
  setRoles: React.Dispatch<React.SetStateAction<"buyer" | "seller" | null>>;
}

const UserAuthContext = createContext<UserAuthContextType | undefined>(
  undefined,
);

export const UserAuthProvider = ({
  role,
  children,
  user_id,
}: {
  user_id: number;
  role: string | undefined;
  children: React.ReactNode;
}) => {
  const [roles, setRoles] = useState<"buyer" | "seller" | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  useEffect(() => {
    // Validate and set role when prop changes
    if (role === "buyer" || role === "both") {
      setUserId(user_id);
      setRoles(role.toString() as "buyer" | "seller");
    } else if (role === "seller") {
      setRoles("seller");
      setUserId(user_id);
    } else {
      setUserId(null);

      setRoles(null);
    }
  }, [role]);

  return (
    <UserAuthContext.Provider value={{ roles, setRoles, userId }}>
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
