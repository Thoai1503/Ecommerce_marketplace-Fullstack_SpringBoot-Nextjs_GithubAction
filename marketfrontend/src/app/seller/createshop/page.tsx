"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type User = {
  id: number;
  fullName: string;
  email: string;
};

type ShopFormData = {
  shopName: string;
  phone: string;
};

export default function ShopInfoPage() {
  const router = useRouter();

  const MAX_SHOP_NAME = 30;

  const [user, setUser] = useState<User | null>(null);

  const [form, setForm] = useState<ShopFormData>({
    shopName: "",
    phone: "",
  });

  const [errors, setErrors] = useState<Partial<ShopFormData>>({});

  /* ======================
      CHECK LOGIN + LOAD USER
  ======================= */
  useEffect(() => {
    const rawUser = localStorage.getItem("user");
    if (!rawUser) {
      router.push("/login");
      return;
    }

    const parsedUser = JSON.parse(rawUser) as User;
    setUser(parsedUser);

    // load draft nếu có
    const saved = localStorage.getItem("seller_step_1");
    if (saved) {
      const data = JSON.parse(saved);
      setForm({
        shopName: data.shopName || "",
        phone: data.phone || "",
      });
    }
  }, [router]);

  if (!user) return null;

  /* ======================
      HANDLE CHANGE
  ======================= */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  /* ======================
      VALIDATE
  ======================= */
  const validate = () => {
    const newErrors: Partial<ShopFormData> = {};

    if (!form.shopName.trim()) {
      newErrors.shopName = "Tên shop là bắt buộc";
    } else if (form.shopName.trim().length < 3) {
      newErrors.shopName = "Tên shop tối thiểu 3 ký tự";
    }

    if (!form.phone.trim()) {
      newErrors.phone = "Số điện thoại là bắt buộc";
    } else if (!/^(\+84|0)[0-9]{9}$/.test(form.phone)) {
      newErrors.phone = "Số điện thoại không hợp lệ";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ======================
      SAVE DRAFT
  ======================= */
  const handleSaveDraft = () => {
    localStorage.setItem(
      "seller_step_1",
      JSON.stringify({
        shopName: form.shopName,
        phone: form.phone,
      })
    );
    alert("Đã lưu nháp");
  };

  /* ======================
      SUBMIT
  ======================= */
  const handleSubmit = () => {
    if (!validate()) return;

    // ⚠️ backend KHÔNG tin email từ đây
    localStorage.setItem(
      "seller_step_1",
      JSON.stringify({
        shopName: form.shopName,
        phone: form.phone,
      })
    );

    router.push("/seller/create");
  };

  return (
    <div className="page">
      {/* STEPS */}
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
        {/* SHOP NAME */}
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

        {/* EMAIL */}
        <div className="row">
          <label>Email</label>
          <div className="field">
            <input value={user.email} disabled />
            <small className="note">
              Email được lấy từ tài khoản đăng nhập
            </small>
          </div>
        </div>

        {/* PHONE */}
        <div className="row">
          <label>
            Số điện thoại <span>*</span>
          </label>
          <div className="field">
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="+84 / 0xxx"
            />
            <span className="error">{errors.phone}</span>
          </div>
        </div>
      </div>

      {/* ACTIONS */}
      <div className="actions">
        <button className="btn-outline" onClick={handleSaveDraft}>
          Lưu
        </button>
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

        input:disabled {
          background: #f5f5f5;
          color: #666;
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

        .note {
          font-size: 12px;
          color: #999;
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
