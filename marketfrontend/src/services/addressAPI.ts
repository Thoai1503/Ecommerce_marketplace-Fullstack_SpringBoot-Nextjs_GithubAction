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

<<<<<<< HEAD
export const getDistricts = async (provinceId: number): Promise<any> => {
  return await addressAPI
    .get(`/v1/p/${provinceId}?depth=2`)
    .then((res) => res.data)
=======
export const getDistricts = async (provinceId: number): Promise<District[]> => {
  return await addressAPI
    .get(`${PROVINCE_API}/district?province_id=${provinceId}`, {
      headers: {
        Token: ADDRESS_KEY,
      },
    })
    .then((res) => res.data.data)
>>>>>>> 2303dbea4457761743ead14c44865db12e8d57c3
    .catch((error) => {
      throw error;
    });
};

<<<<<<< HEAD
export const getWards = async (districtId: number): Promise<any> => {
  return await addressAPI
    .get(`/v1/d/${districtId}?depth=2`)
    .then((res) => res.data)
=======
export const getWards = async (districtId: number): Promise<Ward[]> => {
  return await addressAPI
    .get(`${PROVINCE_API}/ward?district_id=${districtId}`, {
      headers: {
        Token: ADDRESS_KEY,
      },
    })
    .then((res) => res.data.data)
>>>>>>> 2303dbea4457761743ead14c44865db12e8d57c3
    .catch((error) => {
      throw error;
    });
};
