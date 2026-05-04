# 📋 Tài liệu Test UI/UX — Tính năng Quên Mật Khẩu
**Dự án:** VietCommerce Hub — Ecommerce Marketplace Microservice  
**Ngày:** 01/05/2026  
**Người thực hiện:** Nguyễn Phan Hoàng Vũ  
**Phiên bản:** 2.0.0

---

## 🗂️ Mục lục

1. [Tổng quan luồng](#1-tổng-quan-luồng)
2. [Chuẩn bị môi trường](#2-chuẩn-bị-môi-trường)
3. [Test — Nhà bán hàng (Seller)](#3-test--nhà-bán-hàng-seller)
   - [Bước 1: Quên mật khẩu](#bước-1--quên-mật-khẩu-seller)
   - [Bước 2: Xác thực OTP](#bước-2--xác-thực-otp-seller)
   - [Bước 3: Đặt mật khẩu mới](#bước-3--đặt-mật-khẩu-mới-seller)
4. [Test — Người dùng (User)](#4-test--người-dùng-user)
   - [Bước 1: Quên mật khẩu](#bước-1--quên-mật-khẩu-user)
   - [Bước 2: Xác thực OTP](#bước-2--xác-thực-otp-user)
   - [Bước 3: Đặt mật khẩu mới](#bước-3--đặt-mật-khẩu-mới-user)
5. [Test bảo mật & Edge Cases](#5-test-bảo-mật--edge-cases)
6. [Checklist tổng hợp](#6-checklist-tổng-hợp)
7. [Kết quả tổng hợp](#7-kết-quả-tổng-hợp)

---

## 1. Tổng quan luồng

Tính năng bao gồm **2 luồng song song** (Seller & User), mỗi luồng gồm **3 bước**:

```
Bước 1                    Bước 2                    Bước 3
┌──────────────────┐      ┌──────────────────┐      ┌──────────────────┐
│  Nhập Email      │ ───▶ │  Nhập OTP 6 số   │ ───▶ │  Đặt mật khẩu   │
│  /forgot-password│      │  /verify-otp     │      │  /reset-password │
└──────────────────┘      └──────────────────┘      └──────────────────┘
   sessionStorage              sessionStorage             API call
   lưu email                   lưu resetToken             + xóa storage
```

| Luồng | Bước 1 | Bước 2 | Bước 3 | Sau thành công |
|---|---|---|---|---|
| 🏪 Nhà bán hàng | `/seller/forgot-password` | `/seller/verify-otp` | `/seller/reset-password` | `/seller/login` |
| 👤 Người dùng | `/forgot-password` | `/verify-otp` | `/reset-password` | `/login` |

---

## 2. Chuẩn bị môi trường

### ⚙️ Yêu cầu
- Backend Spring Boot chạy tại `http://localhost:8001`
- Frontend Next.js chạy tại `http://localhost:3000`
- Tài khoản email thực để nhận OTP
- Trình duyệt: Chrome / Edge

### 🚀 Khởi động
```bash
# Backend (port 8001)
cd Marketplace-platform && mvn spring-boot:run

# Frontend (port 3000)
cd marketfrontend && npm run dev
```

### 🔑 Tài khoản test
| Vai trò | Email | Ghi chú |
|---|---|---|
| Nhà bán hàng | `hoangvu1805971@gmail.com` | Tài khoản SELLER đã đăng ký |
| Người dùng | `hoangvu1805971@gmail.com` | Tài khoản USER đã đăng ký |
| Email không tồn tại | `test@khongtontai.com` | Dùng test case lỗi |

---

## 3. Test — Nhà bán hàng (Seller)

---

### Bước 1 — Quên mật khẩu (Seller)

**URL:** `http://localhost:3000/seller/forgot-password`

#### Giao diện
| # | Mục kiểm tra | Kết quả mong đợi | Đạt |
|---|---|---|---|
| 1 | Logo VietCommerce Hub | SVG logo + "VietCommerce Hub" + badge "SELLER CENTER" | ☐ |
| 2 | Panel trái màu `blue-700` | Xanh navy đậm, hiệu ứng blur background | ☐ |
| 3 | Thống kê footer | "50k+ Nhà bán hàng" và "Phủ sóng toàn quốc" | ☐ |
| 4 | Tiêu đề form | "Quên mật khẩu? 🔒" | ☐ |
| 5 | Placeholder input | `seller@store.com` | ☐ |
| 6 | Link quay lại | "← Quay lại đăng nhập" → `/seller/login` | ☐ |
| 7 | Nút submit | Màu `blue-700`, text "Gửi mã OTP →" | ☐ |
| 8 | Responsive | Panel trái ẩn trên mobile, form toàn màn hình | ☐ |

#### Test Cases

**TC-S1-01: Happy Path — Gửi OTP thành công**
```
Bước:
1. Mở http://localhost:3000/seller/forgot-password
2. Nhập email: hoangvu1805971@gmail.com
3. Click "Gửi mã OTP"
```
| Kiểm tra | Kết quả mong đợi |
|---|---|
| Nút trong lúc gửi | Spinner + "Đang gửi OTP..." — disabled |
| Sau khi thành công | Màn hình xác nhận: icon ✅ xanh lá |
| Toast | "Đã gửi mã OTP đến email của bạn!" (xanh) |
| Email hiển thị | Hiển thị địa chỉ email vừa nhập |
| Thời hạn | "10 phút" màu cam |
| Nút tiếp theo | "Nhập mã OTP →" xuất hiện |
| sessionStorage | `forgot_email` = email vừa nhập |

---

**TC-S1-02: Email để trống — Bấm submit**
```
Bước:
1. Để trống ô email
2. Click "Gửi mã OTP"
```
| Kiểm tra | Kết quả mong đợi |
|---|---|
| Error message | ⚠ "Vui lòng nhập email" xuất hiện dưới input |
| Border input | Đổi sang màu đỏ (`border-red-400`) |
| Icon Mail | Đổi sang màu đỏ |
| API call | Không gọi API |

---

**TC-S1-03: Email sai định dạng — Không có @**
```
Bước:
1. Nhập: "hoangvu123"
2. Click "Gửi mã OTP"
```
| Kiểm tra | Kết quả mong đợi |
|---|---|
| Error message | ⚠ "Email không đúng định dạng" |
| Border input | Đỏ |
| API call | Không gọi API |

---

**TC-S1-04: Email sai định dạng — Thiếu domain**
```
Bước:
1. Nhập: "hoangvu@"
2. Click "Gửi mã OTP"
```
| Kiểm tra | Kết quả mong đợi |
|---|---|
| Error message | ⚠ "Email không đúng định dạng" |
| API call | Không gọi API |

---

**TC-S1-05: Email hợp lệ nhưng không tồn tại trong hệ thống**
```
Bước:
1. Nhập: test@khongtontai.com
2. Click "Gửi mã OTP"
```
| Kiểm tra | Kết quả mong đợi |
|---|---|
| Toast | "Email không tồn tại trong hệ thống" (đỏ) |
| Form | Vẫn hiển thị, không chuyển trang |

---

**TC-S1-06: Validation onBlur — Rời khỏi input**
```
Bước:
1. Click vào ô email
2. Nhập: "sai-format"
3. Click ra ngoài (blur)
```
| Kiểm tra | Kết quả mong đợi |
|---|---|
| Error hiện ngay | ⚠ "Email không đúng định dạng" khi rời khỏi ô |
| Gõ lại đúng | Error tự biến mất |

---

### Bước 2 — Xác thực OTP (Seller)

**URL:** `http://localhost:3000/seller/verify-otp`

#### Giao diện
| # | Mục kiểm tra | Kết quả mong đợi | Đạt |
|---|---|---|---|
| 1 | Redirect guard | Truy cập trực tiếp → redirect về `/seller/forgot-password` | ☐ |
| 2 | Email hiển thị | Email từ sessionStorage hiển thị đúng | ☐ |
| 3 | 6 ô OTP riêng biệt | Mỗi ô 1 chữ số, border xanh khi focus | ☐ |
| 4 | Auto-focus ô đầu | Vào trang → cursor tự vào ô số 1 | ☐ |
| 5 | Auto-advance | Gõ số → tự nhảy ô tiếp theo | ☐ |
| 6 | Backspace navigation | Xóa ô trống → focus về ô trước | ☐ |
| 7 | Paste hỗ trợ | Paste "123456" → điền đủ 6 ô | ☐ |
| 8 | Nút disabled | Chưa đủ 6 số → nút "Xác nhận" mờ, không click được | ☐ |
| 9 | Đếm ngược 60s | Hiển thị "Gửi lại sau Xs" đếm xuống | ☐ |
| 10 | Nút gửi lại disabled | Trong thời gian đếm ngược → mờ | ☐ |

#### Test Cases

**TC-S2-01: Happy Path — OTP đúng**
```
Bước:
1. Kiểm tra email nhận OTP
2. Điền đúng 6 số vào 6 ô
3. Click "Xác nhận OTP"
```
| Kiểm tra | Kết quả mong đợi |
|---|---|
| Nút loading | Spinner + "Đang xác thực..." |
| Toast | "Xác thực OTP thành công!" (xanh) |
| Chuyển trang | → `/seller/reset-password` |
| sessionStorage | `reset_token` = JWT token |

---

**TC-S2-02: Submit khi chưa điền đủ 6 số**
```
Bước:
1. Chỉ điền 3 ô: "1", "2", "3"
2. (Nút bị disabled nên thử trigger bằng Enter)
```
| Kiểm tra | Kết quả mong đợi |
|---|---|
| Nút | Bị mờ (disabled), không submit được |
| Nếu submit được | ⚠ "Vui lòng nhập đủ 6 chữ số OTP" |
| Ô trống | Highlight border đỏ |
| Focus | Nhảy về ô trống đầu tiên |

---

**TC-S2-03: OTP sai**
```
Bước:
1. Điền OTP sai: "000000"
2. Click "Xác nhận OTP"
```
| Kiểm tra | Kết quả mong đợi |
|---|---|
| Toast | "Mã OTP không chính xác hoặc đã hết hạn." (đỏ) |
| 6 ô | Tự động clear hết |
| Focus | Về ô số 1 |

---

**TC-S2-04: Gửi lại OTP**
```
Bước:
1. Chờ đếm ngược về 0
2. Click "Gửi lại mã"
```
| Kiểm tra | Kết quả mong đợi |
|---|---|
| Nút gửi lại | Khả dụng khi timer = 0 |
| Trong lúc gửi | Icon refresh quay |
| Sau khi gửi | Timer reset về 60, toast "Đã gửi lại mã OTP!" |

---

**TC-S2-05: Nhập OTP bằng Paste**
```
Bước:
1. Copy "123456"
2. Paste vào ô OTP đầu tiên
```
| Kiểm tra | Kết quả mong đợi |
|---|---|
| 6 ô | Tự động điền đủ "1","2","3","4","5","6" |
| Nút Xác nhận | Hết disabled, có thể click |

---

### Bước 3 — Đặt mật khẩu mới (Seller)

**URL:** `http://localhost:3000/seller/reset-password`

#### Giao diện
| # | Mục kiểm tra | Kết quả mong đợi | Đạt |
|---|---|---|---|
| 1 | Redirect guard | Truy cập trực tiếp → redirect về `/seller/forgot-password` | ☐ |
| 2 | Gợi ý bảo mật | Panel trái có checklist: 8 ký tự, chữ hoa, số, ký tự đặc biệt | ☐ |
| 3 | Toggle show/hide | Click icon Eye → text hiện, click lại → ẩn | ☐ |
| 4 | Password strength meter | 4 thanh màu: đỏ → cam → xanh → xanh lá | ☐ |
| 5 | Nhãn độ mạnh | "Yếu" → "Trung bình" → "Khá" → "Rất mạnh" | ☐ |
| 6 | Link hủy | "Hủy và quay lại" → `/seller/login` | ☐ |

#### Test Cases

**TC-S3-01: Happy Path — Đổi mật khẩu thành công**
```
Bước:
1. Nhập mật khẩu mới: "VuHoang@2026"
2. Nhập xác nhận: "VuHoang@2026"
3. Click "Đổi mật khẩu"
```
| Kiểm tra | Kết quả mong đợi |
|---|---|
| Loading | Spinner + "Đang cập nhật..." |
| Toast | "Mật khẩu đã được thay đổi thành công!" (xanh) |
| Màn hình | Chuyển sang "Thành công! 🎉" + icon CheckCircle xanh lá |
| sessionStorage | `forgot_email` và `reset_token` bị xóa |
| Nút | "Đăng nhập ngay →" → `/seller/login` |

---

**TC-S3-02: Mật khẩu quá ngắn (< 8 ký tự)**
```
Bước:
1. Nhập mật khẩu: "abc"
2. Nhập xác nhận: "abc"
3. Click "Đổi mật khẩu"
```
| Kiểm tra | Kết quả mong đợi |
|---|---|
| Error message | ⚠ "Mật khẩu phải có ít nhất 8 ký tự" dưới ô mật khẩu |
| Border | Ô mật khẩu đổi màu đỏ |
| API call | Không gọi API |

---

**TC-S3-03: Xác nhận mật khẩu không khớp**
```
Bước:
1. Nhập mật khẩu: "Abc12345"
2. Nhập xác nhận: "Abc12346" (khác 1 ký tự)
3. Click "Đổi mật khẩu"
```
| Kiểm tra | Kết quả mong đợi |
|---|---|
| Error message | ⚠ "Mật khẩu xác nhận không khớp" dưới ô xác nhận |
| Border | Ô xác nhận đổi màu đỏ |
| API call | Không gọi API |

---

**TC-S3-04: Password Strength Meter**
```
Bước: Nhập lần lượt và quan sát thanh
```
| Mật khẩu nhập | Độ mạnh mong đợi | Màu thanh |
|---|---|---|
| `abc` | Yếu (25%) | Đỏ |
| `abcdefgh` | Trung bình (25%) | Đỏ → vẫn yếu (chỉ đủ 8 ký tự) |
| `Abcdefgh` | Khá (50%) | Cam |
| `Abcdefg1` | Khá (75%) | Xanh |
| `Abcdefg1@` | Rất mạnh (100%) | Xanh lá |

---

**TC-S3-05: Gõ lại sau khi có lỗi — Error tự xóa**
```
Bước:
1. Submit với mật khẩu ngắn → có error
2. Bắt đầu gõ lại mật khẩu mới
```
| Kiểm tra | Kết quả mong đợi |
|---|---|
| Error message | Biến mất ngay khi bắt đầu gõ |
| Border | Trở về màu bình thường |

---

## 4. Test — Người dùng (User)

---

### Bước 1 — Quên mật khẩu (User)

**URL:** `http://localhost:3000/forgot-password`

#### Giao diện (khác biệt so với Seller)
| # | Mục kiểm tra | Kết quả mong đợi | Đạt |
|---|---|---|---|
| 1 | Theme màu `sky-600` | Panel trái xanh nhạt (khác blue-700 của seller) | ☐ |
| 2 | Logo VietCommerce Hub | SVG logo + badge "CUSTOMER PORTAL" | ☐ |
| 3 | Placeholder input | `username@email.com` | ☐ |
| 4 | Link quay lại | "← Quay lại trang đăng nhập" → `/login` | ☐ |
| 5 | Nút submit | Màu `sky-600` | ☐ |
| 6 | Nội dung panel trái | "Bảo mật tuyệt đối" và "Nhanh chóng & Dễ dàng" | ☐ |

#### Test Cases

**TC-U1-01: Happy Path — Gửi OTP thành công**
```
Bước:
1. Mở http://localhost:3000/forgot-password
2. Nhập email: hoangvu1805971@gmail.com
3. Click "Gửi mã xác thực"
```
| Kiểm tra | Kết quả mong đợi |
|---|---|
| Loading | Spinner + "Đang gửi..." |
| Toast | "Mã xác thực đã được gửi đến email của bạn!" (xanh) |
| Màn hình | Chuyển sang xác nhận: icon Mail xanh lá |
| sessionStorage | `user_forgot_email` = email vừa nhập |
| Nút tiếp | "Nhập mã OTP →" |

---

**TC-U1-02: Email để trống**
```
Bước:
1. Để trống ô email
2. Click "Gửi mã xác thực"
```
| Kiểm tra | Kết quả mong đợi |
|---|---|
| Error | ⚠ "Vui lòng nhập email" |
| Border | Đỏ (`border-red-400`) |
| Icon Mail | Đổi sang đỏ |
| API | Không gọi |

---

**TC-U1-03: Email sai định dạng**
```
Bước:
1. Nhập: "hoangvu123"
2. Click submit
```
| Kiểm tra | Kết quả mong đợi |
|---|---|
| Error | ⚠ "Email không đúng định dạng" |
| API | Không gọi |

---

**TC-U1-04: Email không tồn tại**
```
Bước:
1. Nhập: test@khongtontai.com
2. Click submit
```
| Kiểm tra | Kết quả mong đợi |
|---|---|
| Toast | "Email không tồn tại trong hệ thống" (đỏ) |
| Form | Không chuyển trang |

---

**TC-U1-05: Validation onBlur**
```
Bước:
1. Click vào ô email, nhập "abc@"
2. Click ra ngoài
```
| Kiểm tra | Kết quả mong đợi |
|---|---|
| Ngay khi blur | ⚠ "Email không đúng định dạng" hiện ngay |

---

### Bước 2 — Xác thực OTP (User)

**URL:** `http://localhost:3000/verify-otp`

#### Giao diện (khác biệt so với Seller)
| # | Mục kiểm tra | Kết quả mong đợi | Đạt |
|---|---|---|---|
| 1 | Redirect guard | Không có `user_forgot_email` → redirect `/forgot-password` | ☐ |
| 2 | Theme `sky-600` | Border focus ô OTP màu xanh nhạt | ☐ |
| 3 | Link quay lại | "← Thay đổi địa chỉ Email" → `/forgot-password` | ☐ |
| 4 | sessionStorage key riêng | Dùng `user_forgot_email` (không dùng `forgot_email` của seller) | ☐ |

#### Test Cases

**TC-U2-01: Happy Path — OTP đúng**
```
Bước:
1. Kiểm tra email, lấy OTP
2. Điền đúng 6 số
3. Click "Xác nhận OTP"
```
| Kiểm tra | Kết quả mong đợi |
|---|---|
| Toast | "Xác thực mã OTP thành công!" |
| Chuyển trang | → `/reset-password` |
| sessionStorage | `user_reset_token` = JWT token |

---

**TC-U2-02: Chưa điền đủ OTP**
```
Bước: Chỉ điền 4 ô, bấm Enter
```
| Kiểm tra | Kết quả mong đợi |
|---|---|
| Nút | Disabled khi chưa đủ 6 số |
| Error | ⚠ "Vui lòng nhập đủ 6 chữ số OTP" |
| Ô trống | Border đỏ |

---

**TC-U2-03: OTP sai**
```
Bước: Nhập "999999" → Xác nhận
```
| Kiểm tra | Kết quả mong đợi |
|---|---|
| Toast | "Mã OTP không chính xác hoặc đã hết hạn." (đỏ) |
| 6 ô | Tự clear, focus về ô 1 |

---

**TC-U2-04: Paste OTP**
```
Bước: Copy "123456", paste vào ô đầu tiên
```
| Kiểm tra | Kết quả mong đợi |
|---|---|
| 6 ô | Điền đủ tự động |
| Nút | Hết disabled |

---

**TC-U2-05: Gửi lại OTP**
```
Bước: Chờ 60s → Click "Gửi lại"
```
| Kiểm tra | Kết quả mong đợi |
|---|---|
| Timer | Reset về 60 |
| Toast | "Đã gửi lại mã OTP mới đến email của bạn" |

---

### Bước 3 — Đặt mật khẩu mới (User)

**URL:** `http://localhost:3000/reset-password`

#### Giao diện (khác biệt so với Seller)
| # | Mục kiểm tra | Kết quả mong đợi | Đạt |
|---|---|---|---|
| 1 | Redirect guard | Không có `user_reset_token` → redirect `/forgot-password` | ☐ |
| 2 | Theme `sky-600` | Border focus xanh nhạt, nút `bg-sky-600` | ☐ |
| 3 | Link hủy | "Hủy bỏ" → `/login` | ☐ |
| 4 | Nút thành công | "Đăng nhập ngay →" → `/login` (không phải `/seller/login`) | ☐ |
| 5 | Nhãn độ mạnh | "Yếu" / "Vừa" / "Tốt" / "Rất mạnh" (khác seller) | ☐ |

#### Test Cases

**TC-U3-01: Happy Path — Đổi mật khẩu thành công**
```
Bước:
1. Nhập mật khẩu: "UserPass@2026"
2. Xác nhận: "UserPass@2026"
3. Click "Cập nhật mật khẩu"
```
| Kiểm tra | Kết quả mong đợi |
|---|---|
| Toast | "Mật khẩu đã được thay đổi thành công!" |
| Màn hình | "Hoàn tất!" + icon CheckCircle xanh lá |
| sessionStorage | `user_forgot_email` và `user_reset_token` bị xóa |
| Nút | "Đăng nhập ngay →" → `/login` |

---

**TC-U3-02: Mật khẩu quá ngắn**
```
Bước: Nhập "abc" → submit
```
| Kiểm tra | Kết quả mong đợi |
|---|---|
| Error | ⚠ "Mật khẩu phải có ít nhất 8 ký tự" dưới ô |
| Border | Đỏ |
| API | Không gọi |

---

**TC-U3-03: Xác nhận không khớp**
```
Bước: "Abcdefg1" / "Abcdefg2" → submit
```
| Kiểm tra | Kết quả mong đợi |
|---|---|
| Error | ⚠ "Mật khẩu xác nhận không khớp" |
| Border ô xác nhận | Đỏ |
| API | Không gọi |

---

**TC-U3-04: Password Strength Meter (User theme)**
| Mật khẩu | Nhãn mong đợi | Màu |
|---|---|---|
| `abc` | Yếu | Đỏ |
| `Abcdefgh` | Vừa | Cam |
| `Abcdefg1` | Tốt | Sky-blue |
| `Abcdefg1@` | Rất mạnh | Xanh lá |

---

**TC-S3-06: Truy cập trang reset sau khi đã đổi thành công (token đã xóa)**
```
Bước:
1. Đổi mật khẩu thành công
2. Bấm Back trình duyệt về /seller/reset-password
```
| Kiểm tra | Kết quả mong đợi |
|---|---|
| Redirect | Về `/seller/forgot-password` (vì sessionStorage đã xóa) |
| Không thể đổi lại | Form không load, không gọi API với token cũ |

---

**TC-U3-05: Truy cập lại /reset-password sau khi đã đổi thành công**
```
Bước:
1. Đổi mật khẩu user thành công
2. Bấm Back về /reset-password
```
| Kiểm tra | Kết quả mong đợi |
|---|---|
| Redirect | Về `/forgot-password` (sessionStorage đã xóa) |

---

## 5. Test bảo mật & Edge Cases

### 🔐 TC-SEC-01: Không thể bỏ qua bước (Direct Access)

| Hành động | Kết quả mong đợi | Đạt |
|---|---|---|
| Vào `/seller/verify-otp` trực tiếp (không qua bước 1) | Redirect ngay về `/seller/forgot-password` | ☐ |
| Vào `/seller/reset-password` trực tiếp (không qua bước 2) | Redirect ngay về `/seller/forgot-password` | ☐ |
| Vào `/verify-otp` trực tiếp | Redirect ngay về `/forgot-password` | ☐ |
| Vào `/reset-password` trực tiếp | Redirect ngay về `/forgot-password` | ☐ |

---

### 🔐 TC-SEC-02: Rate Limiting — Chống spam email

```
Bước:
1. Gửi forgot-password 3 lần liên tiếp từ cùng IP
2. Gửi lần thứ 4
```
| Kiểm tra | Kết quả mong đợi | Đạt |
|---|---|---|
| Lần 1-3 | Thành công (200 OK) | ☐ |
| Lần 4 | HTTP 429 + Toast "Quá nhiều yêu cầu. Vui lòng thử lại sau 1 giờ." | ☐ |

---

### 🔐 TC-SEC-03: Rate Limiting — Chống brute force OTP

```
Bước:
1. Nhập sai OTP liên tục với cùng email trong 10 phút
```
| Lần | Kết quả mong đợi | Đạt |
|---|---|---|
| 1-2 | "OTP không hợp lệ hoặc đã hết hạn" (400) | ☐ |
| Từ lần 3+ | HTTP 429 + "Nhập sai OTP quá nhiều lần. Vui lòng yêu cầu mã mới sau 10 phút." | ☐ |

---

### 🔐 TC-SEC-04: One-time Reset Token — Không dùng lại được

```
Bước:
1. Hoàn thành đổi mật khẩu thành công lần 1
2. Thử dùng lại resetToken cũ để đổi lần 2
```
| Kiểm tra | Kết quả mong đợi | Đạt |
|---|---|---|
| Lần 1 | Thành công | ☐ |
| Lần 2 (cùng token) | HTTP 400 + "Token đã được sử dụng hoặc hết hạn" | ☐ |

---

### 🔐 TC-SEC-05: OTP hết hạn (10 phút)

```
Bước:
1. Nhận OTP
2. Chờ > 10 phút
3. Nhập OTP đó
```
| Kiểm tra | Kết quả mong đợi | Đạt |
|---|---|---|
| Kết quả | HTTP 400 + "OTP không hợp lệ hoặc đã hết hạn" | ☐ |

---

### 🔐 TC-SEC-06: OTP chỉ dùng 1 lần — Không thể xác thực lại cùng OTP

```
Bước:
1. Nhận OTP, xác thực thành công lần 1 → nhận resetToken
2. Quay lại /seller/verify-otp (hoặc /verify-otp)
3. Nhập lại cùng OTP đó
```
| Kiểm tra | Kết quả mong đợi | Đạt |
|---|---|---|
| Lần 1 | Thành công, nhận resetToken | ☐ |
| Lần 2 (cùng OTP) | HTTP 400 + "OTP không hợp lệ hoặc đã hết hạn" | ☐ |

---

### 🔐 TC-SEC-07: sessionStorage không lẫn lộn Seller/User

```
Bước:
1. Vào /seller/forgot-password, nhập email seller
2. Mở tab mới, vào /forgot-password (user)
3. Kiểm tra sessionStorage
```
| Kiểm tra | Kết quả mong đợi | Đạt |
|---|---|---|
| Key seller | `forgot_email` chứa email seller | ☐ |
| Key user | `user_forgot_email` chứa email user | ☐ |
| Không lẫn lộn | 2 key độc lập, không ghi đè nhau | ☐ |

---

## 6. Checklist tổng hợp

### 📱 Responsive Design
| Màn hình | Kết quả mong đợi | Seller | User |
|---|---|---|---|
| Desktop ≥ 1024px | 2 cột: panel trái + form phải | ☐ | ☐ |
| Tablet 768–1023px | Panel trái ẩn, form toàn chiều ngang | ☐ | ☐ |
| Mobile < 768px | Form stack dọc, padding đủ rộng | ☐ | ☐ |

### ✨ UI/UX Components
| Component | Kiểm tra | Seller | User |
|---|---|---|---|
| Logo VietCommerce Hub | SVG "V" hub hiển thị đúng | ☐ | ☐ |
| Loading spinner | Xuất hiện khi gọi API | ☐ | ☐ |
| Toast success (xanh) | Hiển thị góc màn hình | ☐ | ☐ |
| Toast error (đỏ) | Hiển thị góc màn hình | ☐ | ☐ |
| Inline error message | Hiện dưới field bị lỗi | ☐ | ☐ |
| Border đỏ khi lỗi | Input đổi border-red-400 | ☐ | ☐ |
| Error tự xóa | Biến mất khi gõ lại | ☐ | ☐ |
| Password strength meter | 4 thanh đổi màu | ☐ | ☐ |
| OTP auto-advance | Tự nhảy ô khi gõ số | ☐ | ☐ |
| OTP paste support | Paste 6 số cùng lúc | ☐ | ☐ |
| OTP backspace nav | Xóa → focus ô trước | ☐ | ☐ |
| OTP disabled button | Mờ khi chưa đủ 6 số | ☐ | ☐ |
| Countdown 60 giây | Đếm ngược đúng | ☐ | ☐ |
| Màn hình success | CheckCircle xanh lá sau đổi thành công | ☐ | ☐ |
| Toggle show/hide pwd | Eye icon hoạt động | ☐ | ☐ |

### 🔗 Navigation Links
| Link | Seller | User |
|---|---|---|
| "Quay lại đăng nhập" (bước 1) | `/seller/login` ☐ | `/login` ☐ |
| "Quay lại" (bước 2) | `/seller/forgot-password` ☐ | `/forgot-password` ☐ |
| "Hủy" (bước 3) | `/seller/login` ☐ | `/login` ☐ |
| "Đăng nhập ngay" (success) | `/seller/login` ☐ | `/login` ☐ |

---

## 7. Kết quả tổng hợp

### Seller
| Nhóm | Tổng TC | Đạt | Tỷ lệ |
|---|---|---|---|
| Bước 1 — Quên mật khẩu | 6 | ___ | ___% |
| Bước 2 — Xác thực OTP | 5 | ___ | ___% |
| Bước 3 — Đặt mật khẩu | 6 | ___ | ___% |
| **Subtotal Seller** | **17** | **___** | **___%** |

### User
| Nhóm | Tổng TC | Đạt | Tỷ lệ |
|---|---|---|---|
| Bước 1 — Quên mật khẩu | 5 | ___ | ___% |
| Bước 2 — Xác thực OTP | 5 | ___ | ___% |
| Bước 3 — Đặt mật khẩu | 5 | ___ | ___% |
| **Subtotal User** | **15** | **___** | **___%** |

### Bảo mật & Edge Cases
| Nhóm | Tổng TC | Đạt | Tỷ lệ |
|---|---|---|---|
| Direct Access Guard | 4 | ___ | ___% |
| Rate Limiting (Email spam) | 4 | ___ | ___% |
| Rate Limiting (Brute force OTP) | 2 | ___ | ___% |
| One-time Reset Token | 2 | ___ | ___% |
| OTP hết hạn | 1 | ___ | ___% |
| OTP chỉ dùng 1 lần | 2 | ___ | ___% |
| sessionStorage isolation | 3 | ___ | ___% |
| **Subtotal Bảo mật** | **18** | **___** | **___%** |

### Tổng cộng
| Hạng mục | Tổng | Đạt | Tỷ lệ |
|---|---|---|---|
| Seller | 17 | ___ | ___% |
| User | 15 | ___ | ___% |
| Bảo mật & Edge Cases | 18 | ___ | ___% |
| **TỔNG** | **50** | **___** | **___%** |

---

## 📝 Điểm nhấn kỹ thuật khi thuyết trình

| # | Kỹ thuật | Giải thích ngắn |
|---|---|---|
| 1 | **OTP hash SHA-256** | Không lưu mã OTP gốc trong DB, chỉ lưu hash → lộ DB cũng không biết OTP |
| 2 | **Rate Limiting in-memory** | Sliding window: 3 req/giờ/IP (email spam) + 5 lần/10 phút/email (brute force OTP) |
| 3 | **One-time Reset Token** | JWT lưu vào DB với purpose=RESET_TOKEN, sau 1 lần dùng → đánh dấu used_at → không thể replay |
| 4 | **sessionStorage flow** | Email/token truyền qua sessionStorage (không qua URL) → không lộ trên address bar hay server log |
| 5 | **Redirect Guard** | Layout `/seller/*` whitelist 3 trang forgot/verify/reset → không bị chặn bởi auth middleware |
| 6 | **Inline Validation** | Error message hiện dưới field (không chỉ toast) + border đỏ + onBlur check → UX tốt hơn |
| 7 | **Seller/User isolation** | 2 luồng dùng sessionStorage key khác nhau → không bao giờ lẫn lộn dữ liệu |

---

*Tài liệu cập nhật ngày 01/05/2026 | VietCommerce Hub — Đồ án tốt nghiệp*
