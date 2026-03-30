export interface Province {
  ProvinceID: number;
  ProvinceName: string;
  Code: number;
}

export interface District {
  DistrictID: number;
  ProvinceID: number;
  DistrictName: string;
}

export interface Ward {
  WardCode: number;
  DistrictID: number;
  WardName: string;
}

export interface CheckFeeData {
  from_district_id: number;
  from_ward_code: "21211";
  service_id: 53320;
  service_type_id: null;
  to_district_id: 1452;
  to_ward_code: "21012";
  height: 50;
  length: 20;
  weight: 200;
  width: 20;
  insurance_value: 10000;
  cod_failed_amount: 2000;
  coupon: null;
  items: [
    {
      name: "TEST1";
      quantity: 1;
      height: 200;
      weight: 1000;
      length: 200;
      width: 200;
    },
  ];
}
