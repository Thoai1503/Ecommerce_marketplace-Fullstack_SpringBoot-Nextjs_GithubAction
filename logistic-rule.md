# Quy tắc thay đổi trạng thái vận chuyển

Từ trạng thái PENDING đến OUT_FOR_DELIVERY qua mỗi bước thay đổi đều không thể quay trở về status cũ , riêng từ bước DELIVERED -> FAILED có thể thôi đổi qua lại tối đa 3 lần ,nếu lần thứ 3 vẫn FAILED đổi qua tiến hành trả hàng và cũng không thể quay về trạng thái cũ.

Cứ mỗi bước được cập nhật lập tức lưu thông tin vào bảng shipment_status_history từ đó truy vết để chặn lỗi lui về trạng thái trước đó
