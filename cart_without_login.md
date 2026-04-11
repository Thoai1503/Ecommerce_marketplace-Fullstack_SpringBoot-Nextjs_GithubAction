# Chỉnh sửa cách hiển thị trang cart khi chưa đăng nhập

localStorage.getItem("preLoginCart") ->
'[{"user_id":null,"product_id":116,"variant_id":13,"quantity":3},{"user_id":null,"product_id":111,"variant_id":8,"quantity":6},{"user_id":null,"product_id":4,"variant_id":1,"quantity":2},{"user_id":null,"product_id":117,"variant_id":14,"quantity":6}]'

dựa vào đây chỉnh sửa cách hiển thị trang cart như sau:

- Khi user đăng nhập rồi (userId !=null) thì gọi hẳn api của cart lấy ra dữ liệu
- Khi user chưa đăng nhập lấy thông tin cart từ localStorage.getItem("preLoginCart") và gọi thêm các api khác để lấy thêm ra các thông tin cần thiết
