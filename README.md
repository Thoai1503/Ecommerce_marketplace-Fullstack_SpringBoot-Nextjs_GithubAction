# E-Commerce Marketplace Portfolio Case Study

Trang portfolio mô tả chi tiết một dự án thương mại điện tử theo hướng fullstack/microservices, tập trung vào luồng nghiệp vụ thực tế: voucher, giỏ hàng, checkout, xử lý đơn, hoàn trả và vận hành service Docker.

## Muc luc

- [Tong quan](#tong-quan)
- [Demo](#demo)
- [Tinh nang noi bat](#tinh-nang-noi-bat)
- [Cong nghe su dung](#cong-nghe-su-dung)
- [Hinh anh giao dien](#hinh-anh-giao-dien)
- [Cau truc du an](#cau-truc-du-an)
- [Chay local](#chay-local)
- [Chay bang Docker](#chay-bang-docker)
- [Thong tin lien he](#thong-tin-lien-he)

## Tong quan

Dự án trình bày case study E-Commerce Platform với các nội dung chính:

- Bài toán đồng bộ tồn kho và chống race condition.
- Luồng mua hàng hoàn chỉnh từ voucher đến checkout.
- Luồng xử lý đơn phía nhà bán hàng.
- Luồng trả hàng và hoàn tiền.
- Theo dõi vận hành service bằng Docker stats.
- Tổng hợp các giải pháp kỹ thuật đã áp dụng trong hệ thống.

## Demo

- Website demo: https://nexamart.duckdns.org/
- Source code (microservice): https://github.com/Thoai1503/Ecommerce_marketplace-Microservice_GithubAction
- Trang case study trong project này: `/ecommerce.html`

## Tinh nang noi bat

### 1) Voucher feature

- Hỗ trợ mã giảm giá theo chiến dịch/sales mùa vụ.
- Dữ liệu voucher đa dạng: loại giảm giá, điều kiện áp dụng, thời hạn, phạm vi áp dụng.

### 2) Shopping cart

- Trải nghiệm giỏ hàng liền mạch trên desktop/mobile.
- Luồng chuyển đổi guest cart sang user cart khi đăng nhập/checkout.

### 3) Checkout

- Tích hợp nhiều phương thức thanh toán.
- Chọn vận chuyển theo kiện hàng.
- Áp dụng voucher và cập nhật tổng tiền theo thời gian thực.

### 4) Order review

- Xem chi tiết đơn hàng và trạng thái vận chuyển.
- Theo dõi từng kiện hàng trong cùng một đơn.

### 5) Nha ban hang processing

- Nhà bán hàng nhận thông báo đơn mới.
- Chấp nhận đơn và nhận mã vận đơn từ logistics.
- Quản trị trạng thái đơn và xử lý yêu cầu hậu mãi.

### 6) Return process

- Duyệt/từ chối yêu cầu trả hàng theo chính sách.
- Thu hồi sản phẩm qua logistics.
- Tự động hoàn tiền sau khi xác nhận hàng trả đạt yêu cầu.

### 7) Docker stats services

- Theo dõi tài nguyên và trạng thái các service container trong môi trường Linux VPS.

## Cong nghe su dung

### Frontend

- Next.js 15
- React 19
- Tailwind CSS
- TypeScript

### Backend/System (trong case study)

- Node.js / NestJS
- Java Spring Boot
- Kafka (microservices)
- Redis
- MySQL / SQL Server
- Hibernate

### Infrastructure

- Docker
- Nginx
- Linux VPS
- GitHub Actions 

## Hinh anh giao dien

### Hero

![Hero section](https://res.cloudinary.com/dizx3mbgw/image/upload/v1780035551/Screenshot_2026-05-26_181728_mqe4ep.png)

### Shopping Cart

![Shopping cart](https://res.cloudinary.com/dizx3mbgw/image/upload/v1780050229/Screenshot_2026-05-29_172325_m8oizj.png)

### Checkout

![Checkout](https://res.cloudinary.com/dizx3mbgw/image/upload/v1780036409/Screenshot_2026-05-23_122853_cjcteu.png)

### Order Tracking

![Order tracking](https://res.cloudinary.com/dizx3mbgw/image/upload/v1780054813/Screenshot_2026-05-29_183945_xrpv1v.png)

### Return Process

![Return process](https://res.cloudinary.com/dizx3mbgw/image/upload/v1780098295/Screenshot_2026-05-30_064003_ijn5tg.png)

### Docker Stats Services

![Docker stats services](https://res.cloudinary.com/dizx3mbgw/image/upload/v1780101590/Screenshot_2026-05-30_073936_o0fxw6.png)

## Cau truc du an

```text
.
├─ app/
├─ components/
├─ public/
│  ├─ ecommerce.html
│  ├─ electrics-shop.html
│  ├─ skill.html
│  └─ shared/
│     ├─ navbar.html
│     ├─ navbar-loader.js
│     ├─ footer.html
│     └─ footer-loader.js
├─ Dockerfile
├─ package.json
└─ tsconfig.json
```

## Chay local

### Yeu cau

- Node.js 20+
- npm

### Cai dat va chay

```bash
npm install
npm run dev
```

Mở trình duyệt:

- Trang chủ Next app: `http://localhost:3000`
- Trang case study: `http://localhost:3000/ecommerce.html`
- Trang skill: `http://localhost:3000/skill.html`

## Chay bang Docker

```bash
docker build -t portfolio-app .
docker run -p 3000:3000 portfolio-app
```

Mở: `http://localhost:3000`

## Thong tin lien he

- Email: vothoai1503@gmail.com
- Phone: 0862830787

---

Nếu bạn muốn mở rộng README này, có thể bổ sung thêm:

- Sơ đồ kiến trúc microservices (Mermaid).
- API contract mẫu cho checkout/returns.
- Quy trình CI/CD cụ thể theo GitHub Actions hoặc GitLab CI.
