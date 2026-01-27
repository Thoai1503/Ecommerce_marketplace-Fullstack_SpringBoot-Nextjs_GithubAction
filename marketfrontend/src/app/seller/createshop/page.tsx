"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type ShopFormData = {
  shopName: string;
  email: string;
  phone: string;
};

export default function ShopInfoPage() {
  const router = useRouter();

  const [form, setForm] = useState<ShopFormData>({
    shopName: "",
    email: "",
    phone: "",
  });

  const [errors, setErrors] = useState<Partial<ShopFormData>>({});

  const MAX_SHOP_NAME = 30;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const newErrors: Partial<ShopFormData> = {};

    if (!form.shopName.trim()) {
      newErrors.shopName = "Tên shop là bắt buộc";
    }

    if (!form.email.trim()) {
      newErrors.email = "Email là bắt buộc";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    if (!form.phone.trim()) {
      newErrors.phone = "Số điện thoại là bắt buộc";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    // Lưu dữ liệu step 1
    localStorage.setItem("seller_step_1", JSON.stringify(form));

    // Chuyển sang step tiếp theo
    router.push("/seller/create");
  };

  return (
    <div className="page">
      {/* STEP */}
      <div className="steps">
        {[
          "Thông tin Shop",
          "Cài đặt vận chuyển",
          "Thông tin định danh",
          "Thông tin thuế",
          "Hoàn tất",
        ].map((step, index) => (
          <div key={step} className={`step ${index === 0 ? "active" : ""}`}>
            {step}
          </div>
        ))}
      </div>

      <hr />

      {/* FORM */}
      <div className="form">
        {/* Tên shop */}
        <div className="row">
          <label>
            Tên Shop <span>*</span>
          </label>
          <div className="field">
            <input
              name="shopName"
              maxLength={MAX_SHOP_NAME}
              value={form.shopName}
              onChange={handleChange}
              placeholder="Nhập tên shop"
            />
            <div className="meta">
              <span className="error">{errors.shopName}</span>
              <span className="counter">
                {form.shopName.length}/{MAX_SHOP_NAME}
              </span>
            </div>
          </div>
        </div>

        {/* Địa chỉ */}
        <div className="row">
          <label>
            Địa chỉ lấy hàng <span>*</span>
          </label>
          <div className="field address">
            <p>Đặng Văn Thành Điệp | 0966273721</p>
            <p>Ủy ban xã Đức Lân</p>
            <p>Xã Đức Lân, Huyện Mộ Đức, Quảng Ngãi</p>
            <button type="button" className="link">
              Chỉnh sửa
            </button>
          </div>
        </div>

        {/* Email */}
        <div className="row">
          <label>
            Email <span>*</span>
          </label>
          <div className="field">
            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="example@gmail.com"
            />
            <span className="error">{errors.email}</span>
          </div>
        </div>

        {/* Phone */}
        <div className="row">
          <label>
            Số điện thoại <span>*</span>
          </label>
          <div className="field">
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="+84..."
            />
            <span className="error">{errors.phone}</span>
          </div>
        </div>
      </div>

      {/* ACTIONS */}
      <div className="actions">
        <button className="btn-outline">Lưu</button>
        <button className="btn-primary" onClick={handleSubmit}>
          Tiếp theo
        </button>
      </div>

      {/* STYLE */}
      <style jsx>{`
        .page {
          max-width: 900px;
          margin: 40px auto;
          background: #fff;
          padding: 32px;
          border-radius: 6px;
        }

        .steps {
          display: flex;
          gap: 24px;
          font-size: 14px;
        }

        .step {
          color: #bbb;
        }

        .step.active {
          color: #ee4d2d;
          font-weight: 600;
        }

        .row {
          display: flex;
          margin-bottom: 24px;
        }

        label {
          width: 200px;
        }

        label span {
          color: red;
        }

        .field {
          flex: 1;
        }

        input {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }

        .meta {
          display: flex;
          justify-content: space-between;
        }

        .counter {
          font-size: 12px;
          color: #999;
        }

        .error {
          font-size: 12px;
          color: red;
        }

        .address p {
          margin: 2px 0;
        }

        .link {
          background: none;
          border: none;
          color: #1677ff;
          padding: 0;
          cursor: pointer;
        }

        .actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 30px;
        }

        .btn-outline {
          padding: 8px 20px;
          border: 1px solid #ddd;
          background: #fff;
        }

        .btn-primary {
          padding: 8px 20px;
          background: #ee4d2d;
          color: #fff;
          border: none;
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
}
