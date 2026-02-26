"use client";
import { getShopByUserId } from "@/feature/seller/service";
import { Shop } from "@/validators/shop";
import {
  createContext,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";

interface SellerAuthContextType {
  roles: "buyer" | "seller" | "both" | null;
  userId: number | null;
  shop: Shop | null;
  setRoles: React.Dispatch<
    React.SetStateAction<"buyer" | "seller" | "both" | null>
  >;
}

const SellerAuthContext = createContext<SellerAuthContextType | undefined>(
  undefined,
);

export const SellerAuthProvider = ({
  role,
  user_id,
  children,
}: {
  role: "buyer" | "seller" | "both" | undefined;
  user_id: number | undefined;
  children: React.ReactNode;
}) => {
  const [roles, setRoles] = useState<"buyer" | "seller" | "both" | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [shop, setShop] = useState<Shop | null>(null);

  useEffect(() => {
    const fetchShop = async () => {
      if (role && user_id) {
        setRoles(role);
        setUserId(user_id);
        const shopData = await getShopByUserId(user_id);
        console.log("Shop: " + JSON.stringify(shopData));
        setShop(shopData);
      } else {
        setRoles(null);
        setUserId(null);
        setShop(null);
      }
    };

    fetchShop();
  }, [role, user_id]);

  return (
    <SellerAuthContext.Provider value={{ roles, setRoles, userId, shop }}>
      {children}
    </SellerAuthContext.Provider>
  );
};

export const useSellerAuth = () => {
  const context = useContext(SellerAuthContext);
  if (context === undefined) {
    throw new Error("useUserAuth must be used within a UserAuthProvider");
  }
  return context;
};
