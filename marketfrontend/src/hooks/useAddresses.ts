import { useQuery } from "@tanstack/react-query";
import { getAddressesByUserId } from "../service/addresses";

export const useAddresses = (userId: number) => {
  return useQuery({
    queryKey: ["addresses", userId],
    queryFn: () => getAddressesByUserId(userId),
  });
};
