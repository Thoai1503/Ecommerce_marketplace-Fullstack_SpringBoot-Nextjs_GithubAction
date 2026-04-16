# get http://localhost:8000/api/orders/453

Response:
{
"id": 453,
"orderId": 453,
"orderNumber": "ORD20250318001655AA577",
"userId": 1,
"addressId": 7,
"totalAmount": 1.8773E7,
"shippingFee": 0,
"discountAmount": 0,
"finalAmount": 18773000,
"paymentMethod": "cod",
"paymentStatus": "PENDING",
"orderStatus": "PENDING",
"trackingNumber": null,
"items": [
{
"id": 929,
"orderId": 453,
"productId": 4,
"shopId": 1,
"shipmentId": 412,
"variantId": 2,
"productName": "Động Cơ Motor Giảm Tốc 36GP - 555 Răng kim loại 12V/24 , Trục 8mm Device siêu khỏe Tốc Độ Nhiều chọn Lựa",
"variantName": "Động Cơ Motor Giảm Tốc 36GP - 555 BCD",
"image": "https://res.cloudinary.com/dizx3mbgw/image/upload/v1769345689/tuidgun3b26tnyuc2cix.jpg",
"quantity": 1,
"price": 189000.0,
"totalPrice": 189000.0,
"finalQuantity": null,
"isAdjusted": false
},
{
"id": 930,
"orderId": 453,
"productId": 116,
"shopId": 1,
"shipmentId": 412,
"variantId": 13,
"productName": "Google TV Philips 43 inch FullHD LED 43PFT6509 - Hàng Chính Hãng ",
"variantName": "Google TV Philips 43 inch FullHD LED 43PFT6509 - Hàng Chính Hãng ",
"image": "http://res.cloudinary.com/dizx3mbgw/image/upload/v1775738212/t4ipymdzkcgww67w0yqd.webp",
"quantity": 3,
"price": 6190000.0,
"totalPrice": 1.857E7,
"finalQuantity": null,
"isAdjusted": false
},
{
"id": 931,
"orderId": 453,
"productId": 114,
"shopId": 2,
"shipmentId": 413,
"variantId": 11,
"productName": "Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ",
"variantName": "Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ",
"image": "http://res.cloudinary.com/dizx3mbgw/image/upload/v1774186594/b77xkw4ionmf7kidlofn.webp",
"quantity": 2,
"price": 7000.0,
"totalPrice": 14000.0,
"finalQuantity": null,
"isAdjusted": false
}
],
"shipments": [
{
"id": 413,
"orderId": 453,
"shopId": 2,
"trackingNumber": null,
"shippingFee": 0.0,
"totalAmount": 14000.0,
"carrierName": "LOG",
"shippingStatus": "PENDING",
"businessStatus": "NORMAL",
"latestAdjustmentRequestId": null,
"adjustedTotalAmount": null,
"adjustmentRequired": false
},
{
"id": 412,
"orderId": 453,
"shopId": 1,
"trackingNumber": null,
"shippingFee": 0.0,
"totalAmount": 1.8759E7,
"carrierName": "LOG",
"shippingStatus": "PENDING",
"businessStatus": "ADJUSTMENT_PENDING_BUYER",
"latestAdjustmentRequestId": 1,
"adjustedTotalAmount": null,
"adjustmentRequired": true
}
]
}

# get http://localhost:8000/api/orders/shipments/412/adjustment-request

Response:
{
"id": 1,
"requestCode": "ADJ-708A0A9C",
"orderShipmentId": 412,
"orderId": 453,
"shopId": 1,
"status": "PENDING_BUYER",
"shopReason": "Hết 1 tivi",
"buyerNote": null,
"totalOriginalAmount": 0.0,
"totalAdjustedAmount": 0.0,
"totalDiffAmount": 0.0,
"expiresAt": null,
"respondedAt": null,
"createdAt": null,
"updatedAt": null,
"items": [
{
"id": 1,
"orderItemId": 930,
"productId": 116,
"variantId": 13,
"productName": "Google TV Philips 43 inch FullHD LED 43PFT6509 - Hàng Chính Hãng ",
"variantName": "Google TV Philips 43 inch FullHD LED 43PFT6509 - Hàng Chính Hãng ",
"oldQuantity": 3,
"newQuantity": 2,
"unitPrice": 6190000.0,
"oldTotal": 1.857E7,
"newTotal": 1.238E7,
"diffTotal": 6190000.0
}
]
}

# get http://localhost:8000/api/orders/shipments/412

Respones:
{
"shipmentId": 412,
"orderId": 453,
"shopId": 1,
"shippingFee": 0,
"totalAmount": 18759000,
"carrierName": "LOG",
"trackingNumber": null,
"shippingStatus": "PENDING",
"businessStatus": "ADJUSTMENT_PENDING_BUYER",
"adjustmentRequired": true,
"latestAdjustmentRequestId": 1,
"order": {
"orderNumber": "ORD20250318001655AA577",
"userId": 1,
"addressId": 7,
"totalAmount": 1.8759E7,
"shippingFee": 0,
"discountAmount": 0,
"finalAmount": 18773000,
"paymentMethod": "cod",
"paymentStatus": "PENDING",
"orderStatus": "PENDING"
},
"recipient": {
"recipientName": "Thoại Chợ Lớn",
"recipientPhone": "0976499267",
"addressLine": "51 Hiệp Bình",
"ward": "90741",
"district": "3695",
"city": "202",
"postalCode": ""
},
"items": [
{
"id": 929,
"productId": 4,
"variantId": 2,
"productName": "Động Cơ Motor Giảm Tốc 36GP - 555 Răng kim loại 12V/24 , Trục 8mm Device siêu khỏe Tốc Độ Nhiều chọn Lựa",
"variantName": "Động Cơ Motor Giảm Tốc 36GP - 555 BCD",
"image": "https://res.cloudinary.com/dizx3mbgw/image/upload/v1769345689/tuidgun3b26tnyuc2cix.jpg",
"quantity": 1,
"price": 189000.0,
"totalPrice": 189000.0
},
{
"id": 930,
"productId": 116,
"variantId": 13,
"productName": "Google TV Philips 43 inch FullHD LED 43PFT6509 - Hàng Chính Hãng ",
"variantName": "Google TV Philips 43 inch FullHD LED 43PFT6509 - Hàng Chính Hãng ",
"image": "http://res.cloudinary.com/dizx3mbgw/image/upload/v1775738212/t4ipymdzkcgww67w0yqd.webp",
"quantity": 3,
"price": 6190000.0,
"totalPrice": 1.857E7
}
],
"statusHistory": [
{
"id": 17,
"status": "PENDING",
"note": "pending - waiting shop confirmation",
"changedAt": "2026-04-16T02:46:01",
"changedBy": "root"
}
]
}
