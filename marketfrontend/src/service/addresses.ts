import http from "@/lib/http";
import axios from "axios";

export const getAddressesByUserId = async (
  userId: number,
): Promise<AddressResponse[]> => {
  const response = await http.get(`/addresses/user/${userId}`);
  return response.data;
};

interface AddressResponse {
  ward: number;
  district: number;
  city: number;
  addressId: number;
  addressLine: string;
  createdAt: string;
  postalCode: string;
  recipientName: string;
  recipientPhone: string;
  updatedAt: string;
  userId: number;
}
