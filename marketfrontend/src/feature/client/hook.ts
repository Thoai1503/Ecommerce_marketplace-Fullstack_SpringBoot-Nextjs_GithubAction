import { useQuery } from "@tanstack/react-query";
import { productQuery } from "./query";

export const useHomePage = () => {
  const { data: products } = useQuery(productQuery.list);
  return { products };
};
