# Nghiệp vụ điều chỉnh số lượng sản phẩm nếu shop không đủ hàng để bàn giao

- Sau khi user tạo được đơn hàng :thông tin kiện hàng nằm trong đơn hàng (thuộc shop đó ) được gửi đến shop để chờ shop xác nhận chuẩn bị chuyển hàng cho đơn vị vận chuyển, bước xác nhận đơn hàng có 2 luồng như sau:
  - Luồng 1 : nếu shop kiểm tra trong tồn kho đủ hàng theo như trong đơn thì tiến hành xác nhận đơn hàng để gửi cho đơn vị vận chuyển và chuẩn bị giao tiếp tục tiến hành workflow như bình thường.
  - Luồng 2 : nếu shop không đủ hàng có 2 lựa chọn :
  * SHop huỷ đơn (kiện hàng) và điền lý do hiển thị cho người mua xem .
  * Điều chỉnh số lượng món trong kiện (giảm số lượng hoặc bỏ đối với sản phẩm bị thiếu hàng) và gửi thông tin điều chỉnh đến user để user xem: Chấp nhận -> shop tiếp tục xác nhận đơn gửi kiện hàng với thông tin số lượng mà user chấp nhận (nếu kiện hàng thuộc đơn hàng có payment_method!="cod", ngay khi logisitc đã tiếp nhận đơn hàng ->tiến hàng hoàn phần tiền món hàng bị thiếu cho khách .Ngược lại khấu trừ lại trong số tiên cod để user thanh toán khi nhận hàng /Khách không chấp nhận -> huỷ đơn )
