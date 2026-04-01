# ENPOINT lấy district theo provice_id

curl --location --request GET 'https://dev-online-gateway.ghn.vn/shiip/public-api/master-data/district' \
--header 'token: 637170d5-942b-11ea-9821-0281a26fb5d4' \
--header 'Content-Type: application/json' \
--data-raw '{
"province_id":201
}'

Response :
{
"code": 200,
"message": "Success",
"data":[
{
"DistrictID":1442
"ProvinceID":202
"DistrictName":"Quận 1"
"Code":"0201"
"Type":1
"SupportType":0
},
{
"DistrictID":1443
"ProvinceID":202
"DistrictName":"Quận 2"
"Code":"0202"
"Type":1
"SupportType":0
},
{
"DistrictID":1444
"ProvinceID":202
"DistrictName":"Quận 3"
"Code":"0203"
"Type":1
"SupportType":0
},
...
]
}

# ENPOINT lấy ward theo district_id

curl --location --request POST 'https://dev-online-gateway.ghn.vn/shiip/public-api/master-data/ward?district_id' \
--header 'token: 637170d5-942b-11ea-9821-0281a26fb5d4' \
--header 'Content-Type: application/json' \
--data-raw'{"district_id":1566}'

Response :

{
"code": 200,
"message": "Success",
"data": {
"WardCode":510101
"DistrictID":1566
"WardName":"Phường Mỹ Bình"  
 }
{
"WardCode":510102  
 "DistrictID":1566
"WardName":"Phường Mỹ Long"  
 }
{
"WardCode":510103  
 "DistrictID":1566  
 "WardName":"Phường Đông Xuyên"

    }
    {
    "WardCode":510104
    "DistrictID":1566
    "WardName":"Phường Mỹ Xuyên"

    }
    ....

}

Dựa vào đây giúp tôi hiện ra địa chi bằng chữ rõ ràng dựa trên thông tin người nhận có response kiểu như sau:

[
{
"ward": 4,
"district": 1,
"city": 4,
"isDefault": 1,
"addressId": 3,
"addressLine": "456 lê thánh tôn",
"createdAt": "2026-03-31T15:03:56",
"postalCode": "70000",
"recipientName": "Thanh Tú",
"recipientPhone": "0999999999",
"updatedAt": "2026-03-31T15:27:28",
"userId": 7
},
{
"ward": 2,
"district": 4,
"city": 3,
"isDefault": 0,
"addressId": 4,
"addressLine": "33 Thống Nhất",
"createdAt": "2026-03-31T15:41:08",
"postalCode": "70000",
"recipientName": "Tú khùng",
"recipientPhone": "0999999999",
"updatedAt": "2026-03-31T15:41:08",
"userId": 7
}
]

# API tính phí ship

curl --location --request POST 'https://dev-online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/fee' \
 --header 'Content-Type: application/json' \
 --header 'Token: 637170d5-942b-11ea-9821-0281a26fb5d4' \
 --header 'ShopId: 885' \
 --header 'Content-Type: text/plain' \
 --data-raw '{
"from_district_id":1454,
"from_ward_code":"21211",
"service_id":53320,
"service_type_id":null,
"to_district_id":1452,
"to_ward_code":"21012",
"height":50,
"length":20,
"weight":200,
"width":20,
"insurance_value":10000,
"cod_failed_amount":2000,
"coupon": null
"items": [
{
"name": "TEST1",
"quantity": 1,
"height": 200,
"weight": 1000,
"length": 200,
"width": 200
}
]
}'

Response :

{
"code": 200,
"message": "Success",
"data":{
"total":36300,
"service_fee":36300,
"insurance_fee":0,
"pick_station_fee":0,
"coupon_value":0,
"r2s_fee":0,
"document_return":0,
"double_check":0,
"cod_fee":0,
"pick_remote_areas_fee":0,
"deliver_remote_areas_fee":0,
"cod_failed_fee":0,
}
}
