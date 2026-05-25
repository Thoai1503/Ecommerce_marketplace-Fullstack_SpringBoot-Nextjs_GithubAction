# Sửa lại quy trình logic hàm handleSubmitReturnRequest

- sửa lại hàm handleSubmitReturnRequest để sau khi nhấn thì sẽ tạo return request đầu tiên bằng api /api/refunds/multipart và sau khi response trả về thì lấy id của request đó gọi tiếp đến api /api/refunds/${return_request_id}/calculate-final-price để tính ra giá cuối và sau đó lấy giá này cập nhật lại vào trường requested_amount của return_request
