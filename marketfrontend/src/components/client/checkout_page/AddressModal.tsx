import { getAllProvinces, getDistricts, getWards } from "@/services/addressAPI";
import { useUserAuth } from "@/context/UserAuthContext";
import { useCreateUserAddress } from "@/hooks/useAddresses";

import { District, Province, Ward } from "@/validators/addressAPIModel";
import type { Address } from "@/components/client/checkout_page/types";
import { useQuery } from "@tanstack/react-query";
import { message } from "antd";
import {
  Check,
  ChevronDown,
  ChevronUp,
  Home,
  MapPin,
  Phone,
  Plus,
  Star,
  User,
  X,
} from "lucide-react";
import React, { useState } from "react";

interface AddressModalProps {
  setShowAddressPanel: React.Dispatch<React.SetStateAction<boolean>>;
  addresses: Address[];
  setAddresses: React.Dispatch<React.SetStateAction<Address[]>>;
  selectedAddressId: number;
  setSelectedAddressId: React.Dispatch<React.SetStateAction<number>>;
}

const AddressModal = ({
  setShowAddressPanel,
  addresses,
  setAddresses,
  selectedAddressId,
  setSelectedAddressId,
}: AddressModalProps) => {
  const { userId } = useUserAuth();
  const { mutateAsync: createAddressMutate, isPending: isCreatingAddress } =
    useCreateUserAddress();

  const [provinceId, setProvinceId] = useState<number | null>(null);
  const [districtId, setDistrictId] = useState<number | null>(null);

  const { data: provinces = [] } = useQuery({
    queryKey: ["provinces"],
    queryFn: () => getAllProvinces(),
  });

  const { data: districts } = useQuery({
    queryKey: ["districts", provinceId],
    queryFn: () => getDistricts(provinceId || 0),
    enabled: !!provinceId,
  });

  // wards
  const { data: wards } = useQuery({
    queryKey: ["wards", districtId],
    queryFn: () => getWards(districtId || 0),
    enabled: !!districtId,
  });

  console.log("Danh sách tỉnh thành:" + JSON.stringify(provinces));

  const [showAddForm, setShowAddForm] = useState(false);
  // addresses, setAddresses, selectedAddressId, setSelectedAddressId được truyền từ props
  // Đã loại bỏ addressData tĩnh, dùng API động
  const styles: Record<string, React.CSSProperties> = {
    stepTitle: { fontSize: 13, fontWeight: 700, marginBottom: 8 },
    shippingBox: {
      background: "white",
      border: "1px solid #f1f5f9",
      borderRadius: 8,
      padding: "10px 14px",
    },
    paymentBox: {
      background: "#f8fafc",
      border: "1px solid #f1f5f9",
      borderRadius: 12,
      padding: 16,
    },
    paymentIconBox: {
      width: 48,
      height: 48,
      background: "white",
      borderRadius: 8,
      boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },
    linkPrimary: {
      color: "#137fec",
      fontSize: 10,
      fontWeight: 800,
      textTransform: "uppercase",
      letterSpacing: "0.07em",
      textDecoration: "none",
      background: "none",
      border: "none",
      cursor: "pointer",
      padding: 0,
      whiteSpace: "nowrap",
    },
    btnPrimary: {
      background: "#137fec",
      color: "white",
      fontWeight: 800,
      fontSize: 12,
      textTransform: "uppercase",
      letterSpacing: "0.05em",
      padding: "12px 24px",
      borderRadius: 8,
      border: "none",
      boxShadow: "0 4px 14px rgba(19,127,236,0.25)",
      cursor: "pointer",
    },
    btnSecondary: {
      background: "white",
      color: "#475569",
      fontWeight: 800,
      fontSize: 12,
      textTransform: "uppercase",
      letterSpacing: "0.03em",
      padding: "12px 24px",
      borderRadius: 8,
      border: "1px solid #e2e8f0",
      cursor: "pointer",
    },
    productImg: {
      width: 80,
      height: 80,
      borderRadius: 8,
      border: "1px solid #f1f5f9",
      objectFit: "cover",
      background: "#f8fafc",
      flexShrink: 0,
    },
    qtyBadge: {
      fontSize: 10,
      fontWeight: 700,
      background: "#f1f5f9",
      color: "#475569",
      padding: "2px 8px",
      borderRadius: 4,
    },
    reviewNote: {
      border: "1px dashed #e2e8f0",
      borderRadius: 8,
      background: "rgba(248,250,252,0.5)",
      padding: 12,
      textAlign: "center",
    },
    summaryCard: {
      background: "white",
      borderRadius: 12,
      boxShadow: "0 4px 24px rgba(0,0,0,0.09)",
      border: "1px solid #f1f5f9",
      overflow: "hidden",
    },
    summaryHeader: {
      padding: "18px 20px",
      borderBottom: "1px solid #f8fafc",
    },
    itemsBadge: {
      background: "#f1f5f9",
      color: "#64748b",
      fontSize: 10,
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: "0.06em",
      padding: "2px 8px",
      borderRadius: 4,
    },
    couponInput: {
      background: "#f8fafc",
      border: "none",
      borderRadius: 8,
      padding: "12px 70px 12px 16px",
      fontSize: 12,
      width: "100%",
      outline: "none",
      color: "#0f172a",
    },
    couponApply: {
      position: "absolute",
      right: 12,
      top: "50%",
      transform: "translateY(-50%)",
      color: "#137fec",
      fontWeight: 800,
      fontSize: 12,
      textTransform: "uppercase",
      background: "none",
      border: "none",
      cursor: "pointer",
      padding: 0,
    },
    btnOrder: {
      width: "100%",
      background: "#137fec",
      color: "white",
      fontWeight: 800,
      fontSize: 14,
      border: "none",
      borderRadius: 12,
      padding: 16,
      boxShadow: "0 4px 14px rgba(19,127,236,0.25)",
      cursor: "pointer",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 3,
      lineHeight: 1.2,
    },
    infoNote: {
      background: "rgba(241,245,249,0.5)",
      border: "1px solid #e2e8f0",
      borderRadius: 8,
      padding: 14,
    },
    // Modal styles
    overlay: {
      position: "fixed",
      inset: 0,
      background: "rgba(15,23,42,0.55)",
      backdropFilter: "blur(2px)",
      zIndex: 2000, // raised above typical navbar z-index
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 16,
    },
    modal: {
      background: "white",
      borderRadius: 16,
      width: "100%",
      maxWidth: 480,
      boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
      overflow: "hidden",
    },
    modalHeader: {
      padding: "20px 24px 16px",
      borderBottom: "1px solid #f1f5f9",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    },
    inputGroup: {
      display: "flex",
      flexDirection: "column",
      gap: 6,
    },
    inputLabel: {
      fontSize: 11,
      fontWeight: 700,
      color: "#64748b",
      textTransform: "uppercase",
      letterSpacing: "0.06em",
    },
    input: {
      background: "#f8fafc",
      border: "1.5px solid #e2e8f0",
      borderRadius: 8,
      padding: "10px 14px",
      fontSize: 13,
      outline: "none",
      color: "#0f172a",
      width: "100%",
      transition: "border-color 0.15s",
    },
    inputIcon: {
      position: "absolute",
      left: 12,
      top: "50%",
      transform: "translateY(-50%)",
      pointerEvents: "none",
    },
    // Address list item
    addressItem: {
      border: "1.5px solid #e2e8f0",
      borderRadius: 10,
      padding: "12px 14px",
      cursor: "pointer",
      transition: "all 0.15s",
      position: "relative",
    },
    addressItemSelected: {
      border: "1.5px solid #137fec",
      borderRadius: 10,
      padding: "12px 14px",
      cursor: "pointer",
      background: "rgba(19,127,236,0.04)",
      position: "relative",
    },
  };
  // const provinces = Object.keys(addressData);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    province: "",
    district: "",
    ward: "",
    street: "",
    setDefault: false,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  // const districts = form.province
  //     ? Object.keys(addressData[form.province] || {})
  //     : [];
  //   const wards =
  //     form.province && form.district
  //       ? addressData[form.province]?.[form.district] || []
  //       : [];

  const defaultAddress =
    addresses.find((a) => a.id === selectedAddressId) || addresses[0];

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!form.name.trim()) errors.name = "Vui lòng nhập họ tên";
    if (!form.phone.trim()) errors.phone = "Vui lòng nhập số điện thoại";
    else if (!/^(0|\+84)[0-9]{9}$/.test(form.phone.replace(/\s/g, "")))
      errors.phone = "Số điện thoại không hợp lệ";
    if (!form.province) errors.province = "Vui lòng chọn tỉnh/thành phố";
    if (!form.district) errors.district = "Vui lòng chọn quận/huyện";
    if (!form.ward) errors.ward = "Vui lòng chọn phường/xã";
    if (!form.street.trim()) errors.street = "Vui lòng nhập số nhà, tên đường";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddAddress = async () => {
    if (!validateForm()) return;
    if (!userId) {
      message.warning("Vui lòng đăng nhập để thêm địa chỉ.");
      return;
    }

    const selectedProvince = provinces.find(
      (p: Province) => Number(p.ProvinceID) === Number(form.province),
    );
    const selectedDistrict = districts?.find(
      (d: District) => Number(d.DistrictID) === Number(form.district),
    );
    const selectedWard = wards?.find(
      (w: Ward) => Number(w.WardCode) === Number(form.ward),
    );

    try {
      const created = await createAddressMutate({
        userId,
        recipientName: form.name.trim(),
        recipientPhone: form.phone.trim(),
        addressLine: form.street.trim(),
        ward: Number(form.ward),
        district: Number(form.district),
        city: Number(form.province),
        postalCode: "",
        isDefault: form.setDefault ? 1 : 0,
      });

      const createdAddress: Address = {
        id: created.addressId,
        name: created.recipientName,
        phone: created.recipientPhone,
        address:
          `${created.addressLine}, ` +
          `${selectedWard?.WardName || `Phường ${form.ward}`}, ` +
          `${selectedDistrict?.DistrictName || `Quận ${form.district}`}, ` +
          `${selectedProvince?.ProvinceName || `TP ${form.province}`}`,
        ward: created.ward,
        district: created.district,
        city: created.city,
        isDefault: created.isDefault ?? (form.setDefault ? 1 : 0),
      };

      setAddresses((prev) => {
        if (form.setDefault) {
          return [...prev.map((a) => ({ ...a, isDefault: 0 })), createdAddress];
        }
        return [...prev, createdAddress];
      });
      setSelectedAddressId(createdAddress.id);

      setForm({
        name: "",
        phone: "",
        province: "",
        district: "",
        ward: "",
        street: "",
        setDefault: false,
      });
      setFormErrors({});
      setShowAddForm(false);
      message.success("Thêm địa chỉ thành công.");
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        "Không thể thêm địa chỉ. Vui lòng thử lại.";
      message.error(errorMessage);
    }
  };

  const handleSetDefault = (id: number) => {
    setAddresses(
      addresses.map((a) => ({ ...a, isDefault: a.id === id ? 1 : 0 })),
    );
    setSelectedAddressId(id);
  };

  const handleSelectAddress = () => {
    setShowAddressPanel(false);
  };

  return (
    <div
      style={styles.overlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) setShowAddressPanel(false);
      }}
    >
      <div style={styles.modal}>
        {/* Modal Header */}
        <div style={styles.modalHeader}>
          <div className="d-flex align-items-center gap-2">
            <MapPin size={18} color="#137fec" strokeWidth={2} />
            <h4 style={{ fontSize: 15, fontWeight: 800, margin: 0 }}>
              Địa chỉ nhận hàng
            </h4>
          </div>
          <button
            onClick={() => {
              setShowAddressPanel(false);
              setShowAddForm(false);
            }}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 4,
              borderRadius: 6,
              color: "#94a3b8",
            }}
          >
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        <div
          style={{
            padding: "20px 24px",
            maxHeight: "70vh",
            overflowY: "auto",
          }}
        >
          {/* Address list */}
          <div className="d-flex flex-column gap-3 mb-4">
            {addresses.map((addr) => (
              <div
                key={addr.id}
                style={
                  selectedAddressId === addr.id
                    ? styles.addressItemSelected
                    : styles.addressItem
                }
                onClick={() => setSelectedAddressId(addr.id)}
              >
                <div className="d-flex align-items-start gap-3">
                  {/* Radio circle */}
                  <div
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: "50%",
                      border: `2px solid ${selectedAddressId === addr.id ? "#137fec" : "#cbd5e1"}`,
                      background:
                        selectedAddressId === addr.id ? "#137fec" : "white",
                      flexShrink: 0,
                      marginTop: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {selectedAddressId === addr.id && (
                      <div
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          background: "white",
                        }}
                      />
                    )}
                  </div>
                  <div className="flex-grow-1">
                    <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: "#1e293b",
                        }}
                      >
                        {addr.name}
                      </span>
                      <span style={{ fontSize: 11, color: "#64748b" }}>•</span>
                      <span style={{ fontSize: 12, color: "#64748b" }}>
                        {addr.phone}
                      </span>
                      {addr.isDefault === 1 && (
                        <span
                          style={{
                            fontSize: 9,
                            fontWeight: 800,
                            background: "rgba(19,127,236,0.1)",
                            color: "#137fec",
                            padding: "2px 7px",
                            borderRadius: 4,
                            textTransform: "uppercase",
                            letterSpacing: "0.06em",
                          }}
                        >
                          Mặc định
                        </span>
                      )}
                    </div>
                    <p
                      style={{
                        fontSize: 12,
                        color: "#475569",
                        margin: 0,
                        lineHeight: 1.5,
                      }}
                    >
                      {addr.address}
                    </p>
                  </div>
                </div>

                {/* Actions row */}
                {selectedAddressId === addr.id && (
                  <div
                    className="d-flex gap-3 mt-2"
                    style={{ paddingLeft: 30 }}
                  >
                    {addr.isDefault !== 1 && (
                      <button
                        style={{
                          ...styles.linkPrimary,
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSetDefault(addr.id);
                        }}
                      >
                        <Star size={11} strokeWidth={2.5} />
                        Đặt làm mặc định
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Add new address toggle */}
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            style={{
              width: "100%",
              border: "1.5px dashed #cbd5e1",
              borderRadius: 10,
              background: showAddForm ? "rgba(19,127,236,0.03)" : "white",
              padding: "12px 16px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              color: "#137fec",
              fontSize: 13,
              fontWeight: 700,
              transition: "all 0.15s",
            }}
          >
            <span className="d-flex align-items-center gap-2">
              <Plus size={16} strokeWidth={2.5} />
              Thêm địa chỉ mới
            </span>
            {showAddForm ? (
              <ChevronUp size={16} strokeWidth={2} />
            ) : (
              <ChevronDown size={16} strokeWidth={2} />
            )}
          </button>

          {/* Add form */}
          {showAddForm && (
            <div
              style={{
                border: "1px solid #e2e8f0",
                borderRadius: 10,
                padding: 16,
                marginTop: 12,
                background: "#fafbfc",
                display: "flex",
                flexDirection: "column",
                gap: 14,
              }}
            >
              {/* Name */}
              <div style={styles.inputGroup}>
                <label style={styles.inputLabel}>Họ và tên *</label>
                <div style={{ position: "relative" }}>
                  <span style={{ ...styles.inputIcon, color: "#94a3b8" }}>
                    <User size={14} strokeWidth={2} />
                  </span>
                  <input
                    type="text"
                    placeholder="Nhập họ và tên người nhận"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    style={{
                      ...styles.input,
                      paddingLeft: 36,
                      borderColor: formErrors.name ? "#ef4444" : "#e2e8f0",
                    }}
                  />
                </div>
                {formErrors.name && (
                  <span style={{ fontSize: 11, color: "#ef4444" }}>
                    {formErrors.name}
                  </span>
                )}
              </div>

              {/* Phone */}
              <div style={styles.inputGroup}>
                <label style={styles.inputLabel}>Số điện thoại *</label>
                <div style={{ position: "relative" }}>
                  <span style={{ ...styles.inputIcon, color: "#94a3b8" }}>
                    <Phone size={14} strokeWidth={2} />
                  </span>
                  <input
                    type="tel"
                    placeholder="VD: 0901 234 567"
                    value={form.phone}
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
                    }
                    style={{
                      ...styles.input,
                      paddingLeft: 36,
                      borderColor: formErrors.phone ? "#ef4444" : "#e2e8f0",
                    }}
                  />
                </div>
                {formErrors.phone && (
                  <span style={{ fontSize: 11, color: "#ef4444" }}>
                    {formErrors.phone}
                  </span>
                )}
              </div>

              {/* Address selects */}
              {/* Tỉnh/Thành phố */}
              <div style={styles.inputGroup}>
                <label style={styles.inputLabel}>Tỉnh / Thành phố *</label>
                <div style={{ position: "relative" }}>
                  <select
                    value={form.province}
                    onChange={(e) => {
                      setForm({
                        ...form,
                        province: e.target.value,
                        district: "",
                        ward: "",
                      });
                      setProvinceId(
                        e.target.value ? Number(e.target.value) : null,
                      );
                    }}
                    style={{
                      ...styles.input,
                      paddingLeft: 36,
                      appearance: "none",
                      borderColor: formErrors.province ? "#ef4444" : "#e2e8f0",
                      color: form.province ? "#0f172a" : "#94a3b8",
                      cursor: "pointer",
                    }}
                  >
                    <option value="" disabled>
                      Chọn tỉnh / thành phố
                    </option>
                    {provinces.map((p: Province) => (
                      <option key={p.Code} value={p.ProvinceID}>
                        {p.ProvinceName}
                      </option>
                    ))}
                  </select>
                  <span style={{ ...styles.inputIcon, color: "#94a3b8" }}>
                    <MapPin size={14} strokeWidth={2} />
                  </span>
                  <span
                    style={{
                      position: "absolute",
                      right: 12,
                      top: "50%",
                      transform: "translateY(-50%)",
                      pointerEvents: "none",
                      color: "#94a3b8",
                    }}
                  >
                    <ChevronDown size={14} strokeWidth={2} />
                  </span>
                </div>
                {formErrors.province && (
                  <span style={{ fontSize: 11, color: "#ef4444" }}>
                    {formErrors.province}
                  </span>
                )}
              </div>

              {/* Quận/Huyện */}
              <div style={styles.inputGroup}>
                <label style={styles.inputLabel}>Quận / Huyện *</label>
                <div style={{ position: "relative" }}>
                  <select
                    value={form.district}
                    onChange={(e) => {
                      setForm({
                        ...form,
                        district: e.target.value,
                        ward: "",
                      });

                      setDistrictId(
                        e.target.value ? Number(e.target.value) : null,
                      );
                    }}
                    disabled={!form.province}
                    style={{
                      ...styles.input,
                      paddingLeft: 36,
                      appearance: "none",
                      borderColor: formErrors.district ? "#ef4444" : "#e2e8f0",
                      color: form.district ? "#0f172a" : "#94a3b8",
                      cursor: form.province ? "pointer" : "not-allowed",
                      opacity: form.province ? 1 : 0.55,
                    }}
                  >
                    <option value="" disabled>
                      {form.province
                        ? "Chọn quận / huyện"
                        : "Chọn tỉnh/thành trước"}
                    </option>
                    {districts?.map((d: District) => (
                      <option key={d.DistrictID} value={d.DistrictID}>
                        {d.DistrictName}
                      </option>
                    ))}
                  </select>
                  <span style={{ ...styles.inputIcon, color: "#94a3b8" }}>
                    <Home size={14} strokeWidth={2} />
                  </span>
                  <span
                    style={{
                      position: "absolute",
                      right: 12,
                      top: "50%",
                      transform: "translateY(-50%)",
                      pointerEvents: "none",
                      color: "#94a3b8",
                    }}
                  >
                    <ChevronDown size={14} strokeWidth={2} />
                  </span>
                </div>
                {formErrors.district && (
                  <span style={{ fontSize: 11, color: "#ef4444" }}>
                    {formErrors.district}
                  </span>
                )}
              </div>

              {/* Phường/Xã */}
              <div style={styles.inputGroup}>
                <label style={styles.inputLabel}>Phường / Xã *</label>
                <div style={{ position: "relative" }}>
                  <select
                    value={form.ward}
                    onChange={(e) => setForm({ ...form, ward: e.target.value })}
                    disabled={!form.district}
                    style={{
                      ...styles.input,
                      paddingLeft: 36,
                      appearance: "none",
                      borderColor: formErrors.ward ? "#ef4444" : "#e2e8f0",
                      color: form.ward ? "#0f172a" : "#94a3b8",
                      cursor: form.district ? "pointer" : "not-allowed",
                      opacity: form.district ? 1 : 0.55,
                    }}
                  >
                    <option value="" disabled>
                      {form.district
                        ? "Chọn phường / xã"
                        : "Chọn quận/huyện trước"}
                    </option>
                    {wards?.map((w: Ward) => (
                      <option key={w.WardCode} value={w.WardCode}>
                        {w.WardName}
                      </option>
                    ))}
                  </select>
                  <span style={{ ...styles.inputIcon, color: "#94a3b8" }}>
                    <MapPin size={14} strokeWidth={2} />
                  </span>
                  <span
                    style={{
                      position: "absolute",
                      right: 12,
                      top: "50%",
                      transform: "translateY(-50%)",
                      pointerEvents: "none",
                      color: "#94a3b8",
                    }}
                  >
                    <ChevronDown size={14} strokeWidth={2} />
                  </span>
                </div>
                {formErrors.ward && (
                  <span style={{ fontSize: 11, color: "#ef4444" }}>
                    {formErrors.ward}
                  </span>
                )}
              </div>

              {/* Street */}
              <div style={styles.inputGroup}>
                <label style={styles.inputLabel}>Số nhà, tên đường *</label>
                <div style={{ position: "relative" }}>
                  <span style={{ ...styles.inputIcon, color: "#94a3b8" }}>
                    <Home size={14} strokeWidth={2} />
                  </span>
                  <input
                    type="text"
                    placeholder="VD: 123 Đường Lê Lợi"
                    value={form.street}
                    onChange={(e) =>
                      setForm({ ...form, street: e.target.value })
                    }
                    style={{
                      ...styles.input,
                      paddingLeft: 36,
                      borderColor: formErrors.street ? "#ef4444" : "#e2e8f0",
                    }}
                  />
                </div>
                {formErrors.street && (
                  <span style={{ fontSize: 11, color: "#ef4444" }}>
                    {formErrors.street}
                  </span>
                )}
              </div>

              {/* Set default checkbox */}
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  cursor: "pointer",
                  userSelect: "none",
                }}
              >
                <div
                  onClick={() =>
                    setForm({ ...form, setDefault: !form.setDefault })
                  }
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 4,
                    border: `2px solid ${form.setDefault ? "#137fec" : "#cbd5e1"}`,
                    background: form.setDefault ? "#137fec" : "white",
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.15s",
                  }}
                >
                  {form.setDefault && (
                    <Check size={11} strokeWidth={3} color="white" />
                  )}
                </div>
                <span
                  style={{
                    fontSize: 12,
                    color: "#475569",
                    fontWeight: 600,
                  }}
                >
                  Đặt làm địa chỉ mặc định
                </span>
              </label>

              {/* Submit */}
              <button
                onClick={handleAddAddress}
                disabled={isCreatingAddress}
                style={{
                  background: "#137fec",
                  color: "white",
                  fontWeight: 800,
                  fontSize: 12,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  padding: "11px 20px",
                  borderRadius: 8,
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  boxShadow: "0 4px 14px rgba(19,127,236,0.2)",
                  opacity: isCreatingAddress ? 0.7 : 1,
                }}
              >
                <Plus size={15} strokeWidth={2.5} />
                {isCreatingAddress ? "Đang lưu..." : "Lưu địa chỉ"}
              </button>
            </div>
          )}
        </div>

        {/* Modal footer */}
        <div
          style={{
            padding: "16px 24px",
            borderTop: "1px solid #f1f5f9",
            display: "flex",
            gap: 12,
          }}
        >
          <button
            style={styles.btnSecondary}
            className="flex-fill"
            onClick={() => {
              setShowAddressPanel(false);
              setShowAddForm(false);
            }}
          >
            Hủy
          </button>
          <button
            style={{
              ...styles.btnPrimary,
              flex: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
            onClick={handleSelectAddress}
          >
            <Check size={15} strokeWidth={2.5} />
            Xác nhận địa chỉ
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddressModal;
