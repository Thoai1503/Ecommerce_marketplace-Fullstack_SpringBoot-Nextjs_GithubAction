import { ADDRESS_KEY, PROVINCE_API } from "@/helper/api";
import { addressAPI } from "@/lib/http";
import { District, Province, Ward } from "@/validators/addressAPIModel";
import axios from "axios";

export const getAllProvinces = async (): Promise<Province[]> => {
  return await axios
    .get(`${PROVINCE_API}/province`, {
      headers: {
        Token: ADDRESS_KEY,
      },
    })
    .then((res) => res.data.data)
    .catch((error) => {
      throw error;
    });
};

export const getDistricts = async (provinceId: number): Promise<District[]> => {
  return await addressAPI
    .get(`${PROVINCE_API}/district?province_id=${provinceId}`, {
      headers: {
        Token: ADDRESS_KEY,
      },
    })
    .then((res) => res.data.data)
    .catch((error) => {
      throw error;
    });
};

export const getWards = async (districtId: number): Promise<Ward[]> => {
  return await addressAPI
    .get(`${PROVINCE_API}/ward?district_id=${districtId}`, {
      headers: {
        Token: ADDRESS_KEY,
      },
    })
    .then((res) => res.data.data)
    .catch((error) => {
      throw error;
    });
};
