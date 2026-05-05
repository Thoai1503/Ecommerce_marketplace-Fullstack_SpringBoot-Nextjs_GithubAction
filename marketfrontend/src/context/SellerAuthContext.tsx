"use client";
import { getShopByUserId } from "@/feature/seller/service";
import { Shop } from "@/validators/shop";
import { useRouter } from "next/navigation";
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
  const router = useRouter();

  useEffect(() => {
    const fetchShop = async () => {
      if (role && user_id) {
        setRoles(role);
        setUserId(user_id);

        try {
          const shopData = await getShopByUserId(user_id);
          console.log("Shop: " + JSON.stringify(shopData));
          setShop(shopData);

          const isSellerComplete =
            !!shopData?.id &&
            !!shopData?.owner_name &&
            !!shopData?.business_license &&
            !!shopData?.tax_code &&
            !!shopData?.url_card_front &&
            !!shopData?.url_card_back;

          if (!isSellerComplete) {
            router.push("/seller/createshop"); // đổi path đúng form đăng ký shop của bạn
          }
        } catch (error) {
          setShop(null);
          router.push("/seller/createshop");
        }
      } else {
        setRoles(null);
        setUserId(null);
        setShop(null);
      }
    };

    fetchShop();
  }, [role, user_id, router]);

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
