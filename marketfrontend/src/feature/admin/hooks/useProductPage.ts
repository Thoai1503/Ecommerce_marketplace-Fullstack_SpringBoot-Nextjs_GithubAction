import { useSellerAuth } from "@/context/SellerAuthContext";
import { IProduct } from "@/validators/product";
import { useEffect, useState } from "react";
import { getProductByShopId } from "../service";

export const useProductPage = () => {
  const [products, setProducts] = useState<Partial<IProduct>[]>([]);
  const { shop } = useSellerAuth();

  useEffect(() => {
    const fetchProducts = async () => {
      if (shop) {
        setProducts(await getProductByShopId(shop.id));
      }
    };
    fetchProducts();
  }, [shop]);

  return { products, shop, setProducts };
};
