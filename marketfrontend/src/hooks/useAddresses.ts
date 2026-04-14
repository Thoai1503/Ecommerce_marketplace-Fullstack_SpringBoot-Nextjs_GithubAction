import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createUserAddress,
  CreateUserAddressPayload,
  getAddressesByUserId,
} from "../service/addresses";

export const useAddresses = (userId: number) => {
  return useQuery({
    queryKey: ["addresses", userId],
    queryFn: () => getAddressesByUserId(userId),
  });
};

export const useCreateUserAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateUserAddressPayload) =>
      createUserAddress(payload),
    onSuccess: async (createdAddress) => {
      await queryClient.invalidateQueries({
        queryKey: ["addresses", createdAddress.userId],
      });
    },
  });
};
