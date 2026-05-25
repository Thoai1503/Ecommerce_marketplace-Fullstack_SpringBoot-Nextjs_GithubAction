# Chỉnh sửa trang chi tiết shipment

1. Yêu cầu chỉnh sửa:

- Đối với những order_shipmEnt có shippingStatus là COMPLETED và không có bất cứ return_request nào thì hiện nút thanh toán cho partner ngay phía dưới trang. Còn nếu có return_request thì phải có trạng thái là REFUNDED và order_shipmEnt có shippingStatus là COMPLETED thì mới hiện nút này
