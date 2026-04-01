import { useSellerAuth } from "@/context/SellerAuthContext";
import { IOrder } from "@/validators/order";
import { useEffect, useState } from "react";
import { getOrderByShopId } from "../service";
import { mockOrdersData } from "../mocks/orderMockData";

export const useOrderPage = () => {
  const [orders, setOrders] = useState<Partial<any>[]>([]);
  const { shop } = useSellerAuth();

  useEffect(() => {
    const fetchOrders = async () => {
      if (shop) {
        try {
          // TODO: Replace with actual API call once backend is ready
          // const data = await getOrderByShopId(shop.id);
          // For now, using mock data
          setOrders(mockOrdersData);
        } catch (error) {
          console.error("Error fetching orders:", error);
          // Fallback to mock data on error
          setOrders(mockOrdersData);
        }
      } else {
        // Use mock data when shop is not available (for development)
        setOrders(mockOrdersData);
      }
    };
    fetchOrders();
  }, [shop]);

  return { orders, shop, setOrders };
};
