// Address mapping service untuk convert ID ke nama
interface AddressMapping {
  cities: Record<string, string>;
  districts: Record<string, Record<string, string>>;
  wards: Record<string, Record<string, string>>;
}

const addressMappings: AddressMapping = {
  cities: {
    "1": "Hà Nội",
    "2": "TP Hồ Chí Minh",
    "3": "Đà Nẵng",
    "4": "Hải Phòng",
    "5": "Cần Thơ",
  },
  districts: {
    "1": {
      "1": "Quận Ba Đình",
      "2": "Quận Hoàn Kiếm",
      "3": "Quận Tây Hồ",
      "4": "Quận Cầu Giấy",
    },
    "2": {
      "1": "Quận 1",
      "2": "Quận 2",
      "3": "Quận 3",
      "4": "Quận 4",
    },
    "3": {
      "1": "Quận Hải Châu",
      "2": "Quận Thanh Khê",
    },
    "4": {
      "1": "Quận Hồng Bàng",
      "2": "Quận Ngô Quyền",
    },
  },
  wards: {
    "1": {
      "1": "Phường Phúc Tân",
      "2": "Phường Cửa Đông",
      "3": "Phường Cửa Nam",
      "4": "Phường Phan Chu Trinh",
    },
    "2": {
      "1": "Phường Bến Nghé",
      "2": "Phường Bến Thành",
      "3": "Phường Đa Kao",
      "4": "Phường Nguyễn Thái Bình",
    },
    "3": {
      "1": "Phường Thạch Thang",
      "2": "Phường Hòa Cường Bắc",
    },
    "4": {
      "1": "Phường Máy Chai",
      "2": "Phường Cát Dài",
    },
  },
};

export interface AddressInfo {
  city: string;
  district: string;
  ward: string;
  fullAddress: string;
}

export const convertAddressToNames = (
  cityId: string | number,
  districtId: string | number,
  wardId: string | number,
  addressLine: string,
): AddressInfo => {
  const cityKey = String(cityId);
  const districtKey = String(districtId);
  const wardKey = String(wardId);

  const cityName = addressMappings.cities[cityKey] || `TP ${cityId}`;
  const districtName =
    addressMappings.districts[cityKey]?.[districtKey] ||
    `Quận/Huyện ${districtId}`;
  const wardName =
    addressMappings.wards[districtKey]?.[wardKey] || `Phường/Xã ${wardId}`;

  const fullAddress = `${addressLine}, ${wardName}, ${districtName}, ${cityName}`;

  return {
    city: cityName,
    district: districtName,
    ward: wardName,
    fullAddress,
  };
};
