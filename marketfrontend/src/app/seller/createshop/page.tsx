"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { getAllProvinces, getDistricts, getWards } from "@/services/addressAPI";
import { District, Province, Ward } from "@/validators/addressAPIModel";

type User = {
  id: number;
  fullName: string;
  email: string;
};

type ShopFormData = {
  shopName: string;
  pickupAddress: string;
  phone: string;
  provinceId: number | null;
  districtId: number | null;
  wardCode: number | null;
};

type IdentificationFormData = {
  fullName: string;
  idNumber: string;
  idFront: File | null;
  idBack: File | null;
};

type TaxFormData = {
  taxCode: string;
};

type ShopFormErrors = Partial<Record<keyof ShopFormData, string>>;
type IdentificationErrors = Partial<Record<keyof IdentificationFormData, string>>;
type TaxFormErrors = Partial<Record<keyof TaxFormData, string>>;

export default function ShopInfoPage() {
  const router = useRouter();
  const MAX_SHOP_NAME = 30;

  const [step, setStep] = useState(0);
  const [user, setUser] = useState<User | null>(null);
  const [shopId, setShopId] = useState<number | null>(null);

  const [form, setForm] = useState<ShopFormData>({
    shopName: "",
    pickupAddress: "",
    phone: "",
    provinceId: null,
    districtId: null,
    wardCode: null,
  });

  const [identification, setIdentification] =
    useState<IdentificationFormData>({
      fullName: "",
      idNumber: "",
      idFront: null,
      idBack: null,
    });

  const [errors, setErrors] = useState<ShopFormErrors>({});
  const [idErrors, setIdErrors] = useState<IdentificationErrors>({});
  const [taxInfo, setTaxInfo] = useState<TaxFormData>({
    taxCode: "",
  });
  const [taxErrors, setTaxErrors] = useState<TaxFormErrors>({});

  useEffect(() => {
    const rawUser = localStorage.getItem("user");

    if (!rawUser) {
      router.push("/login");
      return;
    }

    const parsedUser = JSON.parse(rawUser) as User;
    setUser(parsedUser);

    setIdentification((prev) => ({
      ...prev,
      fullName: parsedUser.fullName || "",
    }));

    const saved = localStorage.getItem("seller_step_1");
    if (saved) {
      const data = JSON.parse(saved);
      setForm({
        shopName: data.shopName || "",
        pickupAddress: data.pickupAddress || "",
        phone: data.phone || "",
        provinceId: data.provinceId ?? null,
        districtId: data.districtId ?? null,
        wardCode: data.wardCode ?? null,
      });
    }

    const savedStep2 = localStorage.getItem("seller_step_2");
    if (savedStep2) {
      const data = JSON.parse(savedStep2);
      setIdentification((prev) => ({
        ...prev,
        fullName: data.fullName || prev.fullName,
        idNumber: data.idNumber || "",
      }));
    }

    const savedStep3 = localStorage.getItem("seller_step_3");
    if (savedStep3) {
      const data = JSON.parse(savedStep3);
      setTaxInfo({
        taxCode: data.taxCode || "",
      });
    }

    const savedShopId = Number(localStorage.getItem("seller_shop_id") || 0);
    const savedShopUserId = Number(
      localStorage.getItem("seller_shop_user_id") || 0,
    );

    if (savedShopId > 0 && savedShopUserId === parsedUser.id) {
      setShopId(savedShopId);
    } else {
      localStorage.removeItem("seller_shop_id");
      localStorage.removeItem("seller_shop_user_id");
    }

    const loadExistingShop = async () => {
      if (!parsedUser?.id) return;
      if (savedShopId > 0) return;

      try {
        const shopRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/seller/shop/user/${parsedUser.id}`,
        );

        if (!shopRes.ok) return;

        const shopData = await shopRes.json();
        const existingShopId = Number(shopData?.id ?? shopData?.shop_id ?? 0);
        if (existingShopId > 0) {
          setShopId(existingShopId);
          localStorage.setItem("seller_shop_id", String(existingShopId));
          localStorage.setItem("seller_shop_user_id", String(parsedUser.id));
        }
      } catch (err) {
        console.log("Unable to load existing shop for current user", err);
      }
    };

    loadExistingShop();
  }, [router]);

  const { data: provinces = [] } = useQuery<Province[], Error>({
    queryKey: ["provinces"],
    queryFn: () => getAllProvinces(),
  });

  const { data: districts = [] } = useQuery<District[], Error>({
    queryKey: ["districts", form.provinceId],
    queryFn: () => getDistricts(form.provinceId || 0),
    enabled: !!form.provinceId,
  });

  const { data: wards = [] } = useQuery<Ward[], Error>({
    queryKey: ["wards", form.districtId],
    queryFn: () => getWards(form.districtId || 0),
    enabled: !!form.districtId,
  });

  if (!user) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    const parsedValue = ["provinceId", "districtId", "wardCode"].includes(name)
      ? value === ""
        ? null
        : Number(value)
      : value;

    setForm((prev) => {
      const nextState = {
        ...prev,
        [name]: parsedValue,
      } as ShopFormData;

      if (name === "provinceId") {
        nextState.districtId = null;
        nextState.wardCode = null;
      }

      if (name === "districtId") {
        nextState.wardCode = null;
      }

      return nextState;
    });

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const handleIdentificationChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const { name, value, files } = e.target;

    setIdentification((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));

    setIdErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const validate = () => {
    const newErrors: ShopFormErrors = {};

    if (!form.shopName.trim()) {
      newErrors.shopName = "Tên shop là bắt buộc";
    } else if (form.shopName.trim().length < 3) {
      newErrors.shopName = "Tên shop tối thiểu 3 ký tự";
    }

    if (!form.provinceId) {
      newErrors.provinceId = "Vui lòng chọn tỉnh/thành phố";
    }

    if (!form.districtId) {
      newErrors.districtId = "Vui lòng chọn quận/huyện";
    }

    if (!form.wardCode) {
      newErrors.wardCode = "Vui lòng chọn phường/xã";
    }

    if (!form.pickupAddress.trim()) {
      newErrors.pickupAddress = "Số nhà và tên đường là bắt buộc";
    } else if (form.pickupAddress.trim().length < 5) {
      newErrors.pickupAddress = "Số nhà và tên đường tối thiểu 5 ký tự";
    }

    if (!form.phone.trim()) {
      newErrors.phone = "Số điện thoại là bắt buộc";
    } else if (!/^(\+84|0)[0-9]{9}$/.test(form.phone.trim())) {
      newErrors.phone = "Số điện thoại không hợp lệ";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateIdentification = () => {
    const newErrors: IdentificationErrors = {};

    if (!identification.fullName.trim()) {
      newErrors.fullName = "Họ tên là bắt buộc";
    }

    if (!identification.idNumber.trim()) {
      newErrors.idNumber = "Số CCCD/CMND là bắt buộc";
    } else if (!/^[0-9]{9,12}$/.test(identification.idNumber.trim())) {
      newErrors.idNumber = "Số CCCD/CMND không hợp lệ";
    }

    if (!identification.idFront) {
      newErrors.idFront = "Vui lòng tải ảnh mặt trước CCCD";
    }

    if (!identification.idBack) {
      newErrors.idBack = "Vui lòng tải ảnh mặt sau CCCD";
    }

    setIdErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveStepOne = () => {
    localStorage.setItem(
      "seller_step_1",
      JSON.stringify({
        shopName: form.shopName.trim(),
        pickupAddress: form.pickupAddress.trim(),
        phone: form.phone.trim(),
        provinceId: form.provinceId,
        districtId: form.districtId,
        wardCode: form.wardCode,
      }),
    );
  };

  const saveStepTwo = () => {
    localStorage.setItem(
      "seller_step_2",
      JSON.stringify({
        fullName: identification.fullName.trim(),
        idNumber: identification.idNumber.trim(),
        idFrontName: identification.idFront?.name || "",
        idBackName: identification.idBack?.name || "",
      }),
    );
  };

  const saveStepThree = () => {
    localStorage.setItem(
      "seller_step_3",
      JSON.stringify({
        taxCode: taxInfo.taxCode.trim(),
      }),
    );
  };

  const handleSaveDraft = () => {
    saveStepOne();
    saveStepTwo();
    saveStepThree();
    alert("Đã lưu nháp");
  };

  const handleSubmitShopInfo = async () => {
    if (!validate()) return;

    try {
      const now = new Date().toISOString().slice(0, 19);

      const savedStep2 = localStorage.getItem("seller_step_2");
      const savedStep3 = localStorage.getItem("seller_step_3");
      const businessLicense = savedStep2 ? JSON.parse(savedStep2).idNumber : "";
      const taxCode = savedStep3 ? JSON.parse(savedStep3).taxCode : "";

      const shopPayload = {
        user_id: Number(user.id),
        shop_name: form.shopName.trim(),
        shop_description: "",
        shop_logo: "",
        shop_banner: "",
        business_license: businessLicense,
        tax_code: taxCode,
        rating: 0,
        total_products: 0,
        total_orders: 0,
        response_rate: 0,
        response_time: 0,
        is_verified: 0,
        is_active: 1,
        created_at: now,
        updated_at: now,
      };

      console.log("SHOP PAYLOAD:", shopPayload);

      const shopRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/shops`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(shopPayload),
      });

      if (!shopRes.ok) {
        const errorText = await shopRes.text();
        console.log("CREATE SHOP ERROR:", errorText);
        alert("Tạo shop thất bại: " + errorText);
        return;
      }

      const shop = await shopRes.json();
      const shopId = Number(shop.id || shop.shop_id || 0);

      if (!shopId) {
        alert("Tạo shop thành công nhưng không lấy được shop id");
        return;
      }

      setShopId(shopId);
      localStorage.setItem("seller_shop_id", String(shopId));
      localStorage.setItem("seller_shop_user_id", String(user.id));

      const addressPayload = {
        shop_id: Number(shopId),
        recipientName: user.fullName || form.shopName.trim(),
        recipientPhone: form.phone.trim(),
        addressLine: form.pickupAddress.trim(),
        ward: form.wardCode,
        district: form.districtId,
        city: form.provinceId,
        postalCode: "",
        isDefault: 1,
        createdAt: now,
        updatedAt: now,
      };

      console.log("ADDRESS PAYLOAD:", addressPayload);

      const addressRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/addresses/shop`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(addressPayload),
        },
      );

      if (!addressRes.ok) {
        const errorText = await addressRes.text();
        console.log("CREATE ADDRESS ERROR:", errorText);
        alert("Lưu địa chỉ thất bại: " + errorText);
        return;
      }

      saveStepOne();
      localStorage.setItem("seller_shop_id", String(shopId));

      setStep(1);
    } catch (err) {
      console.log(err);
      alert("Có lỗi xảy ra");
    }
  };

  const handleSubmitIdentification = () => {
    if (!validateIdentification()) return;

    saveStepTwo();
    setStep(2);
  };

  const handleTaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setTaxInfo((prev) => ({
      ...prev,
      [name]: value,
    }));

    setTaxErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const validateTaxInfo = () => {
    const newErrors: TaxFormErrors = {};

    if (!taxInfo.taxCode.trim()) {
      newErrors.taxCode = "Mã số thuế là bắt buộc";
    }

    setTaxErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitTaxInfo = async () => {
    if (!validateTaxInfo()) return;

    saveStepThree();

    const currentShopId =
      shopId || Number(localStorage.getItem("seller_shop_id") || 0);
    if (!currentShopId) {
      alert("Không tìm thấy shop ID để cập nhật thông tin thuế");
      return;
    }

    try {
      const updatePayload = {
        business_license: identification.idNumber.trim(),
        tax_code: taxInfo.taxCode.trim(),
      };

      const updateRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/shops/${currentShopId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatePayload),
        },
      );

      if (!updateRes.ok) {
        const errorText = await updateRes.text();
        console.log("UPDATE SHOP ERROR:", errorText);
        alert("Lưu thông tin thuế thất bại: " + errorText);
        return;
      }

      setStep(3);
    } catch (err) {
      console.log(err);
      alert("Có lỗi khi lưu thông tin thuế");
    }
  };

  return (
    <div className="page">
      <div className="steps">
        {[
          "Shop information",
          "Identification information",
          "Tax information",
          "Complete",
        ].map((stepName, index) => (
          <div key={stepName} className={`step ${index === step ? "active" : ""}`}>
            {stepName}
          </div>
        ))}
      </div>

      <hr />

      {step === 0 && (
        <>
          <div className="form">
            <div className="row">
              <label>
                Shop name <span>*</span>
              </label>

              <div className="field">
                <input
                  name="shopName"
                  maxLength={MAX_SHOP_NAME}
                  value={form.shopName}
                  onChange={handleChange}
                  placeholder="Enter the shop name"
                />

                <div className="meta">
                  <span className="error">{errors.shopName}</span>
                  <span className="counter">
                    {form.shopName.length}/{MAX_SHOP_NAME}
                  </span>
                </div>
              </div>
            </div>

            <div className="row">
              <label>
                Pickup address <span>*</span>
              </label>

              <div className="field address-grid">
                <div className="address-row">
                  <select
                    name="provinceId"
                    value={form.provinceId ?? ""}
                    onChange={handleChange}
                  >
                    <option value="">Chọn tỉnh/thành</option>
                    {provinces.map((province) => (
                      <option
                        key={province.ProvinceID}
                        value={province.ProvinceID}
                      >
                        {province.ProvinceName}
                      </option>
                    ))}
                  </select>
                  <span className="error">{errors.provinceId}</span>
                </div>

                <div className="address-row">
                  <select
                    name="districtId"
                    value={form.districtId ?? ""}
                    onChange={handleChange}
                    disabled={!form.provinceId}
                  >
                    <option value="">Chọn quận/huyện</option>
                    {districts.map((district) => (
                      <option
                        key={district.DistrictID}
                        value={district.DistrictID}
                      >
                        {district.DistrictName}
                      </option>
                    ))}
                  </select>
                  <span className="error">{errors.districtId}</span>
                </div>

                <div className="address-row">
                  <select
                    name="wardCode"
                    value={form.wardCode ?? ""}
                    onChange={handleChange}
                    disabled={!form.districtId}
                  >
                    <option value="">Chọn phường/xã</option>
                    {wards.map((ward) => (
                      <option key={ward.WardCode} value={ward.WardCode}>
                        {ward.WardName}
                      </option>
                    ))}
                  </select>
                  <span className="error">{errors.wardCode}</span>
                </div>

                <div className="address-row">
                  <input
                    name="pickupAddress"
                    value={form.pickupAddress}
                    onChange={handleChange}
                    placeholder="Số nhà, tên đường"
                  />
                  <span className="error">{errors.pickupAddress}</span>
                </div>
              </div>
            </div>

            <div className="row">
              <label>Email</label>

              <div className="field">
                <input value={user.email} disabled />
                <small className="note">
                  The email address is obtained from the login account.
                </small>
              </div>
            </div>

            <div className="row">
              <label>
                Phone number <span>*</span>
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

          <div className="actions">
            <button className="btn-outline" onClick={handleSaveDraft}>
              Save Draft
            </button>
            <button className="btn-primary" onClick={handleSubmitShopInfo}>
              Next
            </button>
          </div>
        </>
      )}

      {step === 1 && (
        <>
          <div className="form">
            <div className="row">
              <label>
                Full name <span>*</span>
              </label>

              <div className="field">
                <input
                  name="fullName"
                  value={identification.fullName}
                  onChange={handleIdentificationChange}
                  placeholder="Enter full name"
                />
                <span className="error">{idErrors.fullName}</span>
              </div>
            </div>

            <div className="row">
              <label>
                ID number <span>*</span>
              </label>

              <div className="field">
                <input
                  name="idNumber"
                  value={identification.idNumber}
                  onChange={handleIdentificationChange}
                  placeholder="Enter CCCD/CMND number"
                />
                <span className="error">{idErrors.idNumber}</span>
              </div>
            </div>

            <div className="row">
              <label>
                CCCD front <span>*</span>
              </label>

              <div className="field">
                <input
                  name="idFront"
                  type="file"
                  accept="image/*"
                  onChange={handleIdentificationChange}
                />
                <span className="error">{idErrors.idFront}</span>
              </div>
            </div>

            <div className="row">
              <label>
                CCCD back <span>*</span>
              </label>

              <div className="field">
                <input
                  name="idBack"
                  type="file"
                  accept="image/*"
                  onChange={handleIdentificationChange}
                />
                <span className="error">{idErrors.idBack}</span>
              </div>
            </div>
          </div>

          <div className="actions">
            <button className="btn-outline" onClick={() => setStep(0)}>
              Back
            </button>
            <button className="btn-primary" onClick={handleSubmitIdentification}>
              Next
            </button>
          </div>
        </>
      )}

      {step === 2 && (
        <>
          <div className="form">
            <div className="row">
              <label>
                Tax information <span>*</span>
              </label>

              <div className="field">
                <input
                  name="taxCode"
                  value={taxInfo.taxCode}
                  onChange={handleTaxChange}
                  placeholder="Tax code"
                />
                <span className="error">{taxErrors.taxCode}</span>
              </div>
            </div>
          </div>

          <div className="actions">
            <button className="btn-outline" onClick={() => setStep(1)}>
              Back
            </button>
            <button className="btn-primary" onClick={handleSubmitTaxInfo}>
              Next
            </button>
          </div>
        </>
      )}

      {step === 3 && (
        <>
          <div className="form">
            <h3>Complete</h3>
            <p>Shop registration information has been completed.</p>
          </div>

          <div className="actions">
            <button className="btn-outline" onClick={() => setStep(2)}>
              Back
            </button>
            <button className="btn-primary" onClick={() => router.push("/seller")}>
              Go to Seller Center
            </button>
          </div>
        </>
      )}

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

        .address-grid {
          display: grid;
          gap: 12px;
        }

        .address-row {
          display: flex;
          flex-direction: column;
          gap: 6px;
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

        input,
        select {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          background: #fff;
          color: #0f172a;
        }

        input:disabled {
          background: #f5f5f5;
          color: #666;
        }

        .meta {
          display: flex;
          justify-content: space-between;
        }

        .counter,
        .error,
        .note {
          font-size: 12px;
        }

        .counter,
        .note {
          color: #999;
        }

        .error {
          color: red;
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