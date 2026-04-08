import { CalculateFeePayload } from "@/types";

export interface Address {
  id: number;
  name: string;
  phone: string;
  address: string;
  ward?: number;
  district?: number;
  city?: number;
  isDefault: number;
}

export interface ShippingOption {
  id: string;
  name: string;
  estimatedDays: string;
  fee: number;
  calculateFeeAPI?: (params: CalculateFeePayload) => Promise<number>;
}

export interface ShippingSelection {
  [shopId: number]: string;
}
