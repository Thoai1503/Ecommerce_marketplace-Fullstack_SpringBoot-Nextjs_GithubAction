import http from "@/lib/http";

export const getAddressesByUserId = async (
  userId: number,
): Promise<AddressResponse[]> => {
  const response = await http.get(`/addresses/user/${userId}`);
  return response.data;
};

export interface AddressResponse {
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
  isDefault?: number;
}

export interface CreateUserAddressPayload {
  userId: number;
  recipientName: string;
  recipientPhone: string;
  addressLine: string;
  ward: number;
  district: number;
  city: number;
  postalCode?: string;
  isDefault: number;
}

export const createUserAddress = async (
  payload: CreateUserAddressPayload,
): Promise<AddressResponse> => {
  const response = await http.post(`/addresses/user`, payload);
  return response.data;
};

export const getAddressByShopId = async (
  shopId: number,
): Promise<AddressResponse> => {
  const response = await http.get(`/addresses/shop/${shopId}`);
  return response.data;
};
