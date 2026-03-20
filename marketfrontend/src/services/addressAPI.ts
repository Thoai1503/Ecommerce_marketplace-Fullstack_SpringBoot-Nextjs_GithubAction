import { addressAPI } from "@/lib/http";

export const getAllProvinces = async (): Promise<any> => {
  return await addressAPI
    .get("/v1/p")
    .then((res) => res.data)
    .catch((error) => {
      throw error;
    });
};

export const getDistricts = async (provinceId: number): Promise<any> => {
  return await addressAPI
    .get(`/v1/p/${provinceId}?depth=2`)
    .then((res) => res.data)
    .catch((error) => {
      throw error;
    });
};

export const getWards = async (districtId: number): Promise<any> => {
  return await addressAPI
    .get(`/v1/d/${districtId}?depth=2`)
    .then((res) => res.data)
    .catch((error) => {
      throw error;
    });
};
