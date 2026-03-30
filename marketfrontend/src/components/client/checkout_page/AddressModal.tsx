import { getAllProvinces, getDistricts, getWards } from "@/services/addressAPI";

import { District, Province, Ward } from "@/validators/addressAPIModel";
import { useQuery } from "@tanstack/react-query";
import { get } from "http";
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

interface Address {
  id: number;
  name: string;
  phone: string;
  address: string;
  isDefault: boolean;
}
const AddressModal = ({
  setShowAddressPanel,
}: {
  setShowAddressPanel: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const [provinceId, setProvinceId] = useState<number | null>(null);
  const [districtId, setDistrictId] = useState<number | null>(null);
  const [wardId, setWardId] = useState<number | null>(null);

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
  const [selectedAddressId, setSelectedAddressId] = useState(1);
  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: 1,
      name: "Nguyễn Văn A",
      phone: "0901 234 567",
      address: "123 Đường Lê Lợi, P. Bến Thành, Quận 1, TP. HCM",
      isDefault: true,
    },
    {
      id: 2,
      name: "Nguyễn Văn A",
      phone: "0912 345 678",
      address: "456 Đường Nguyễn Huệ, P. Bến Nghé, Quận 1, TP. HCM",
      isDefault: false,
    },
    {
      id: 3,
      name: "Nguyễn Văn A",
      phone: "0912 345 678",
      address: "456 Đường Nguyễn Huệ, P. Bến Nghé, Quận 1, TP. HCM",
      isDefault: false,
    },
    {
      id: 4,
      name: "Nguyễn Văn A",
      phone: "0912 345 678",
      address: "456 Đường Nguyễn Huệ, P. Bến Nghé, Quận 1, TP. HCM",
      isDefault: false,
    },
  ]);
  const addressData: Record<string, Record<string, string[]>> = {
    "TP. Hồ Chí Minh": {
      "Quận 1": [
        "P. Bến Nghé",
        "P. Bến Thành",
        "P. Cô Giang",
        "P. Cầu Kho",
        "P. Cầu Ông Lãnh",
        "P. Đa Kao",
        "P. Nguyễn Cư Trinh",
        "P. Nguyễn Thái Bình",
        "P. Phạm Ngũ Lão",
        "P. Tân Định",
      ],
      "Quận 3": [
        "P. 1",
        "P. 2",
        "P. 3",
        "P. 4",
        "P. 5",
        "P. 6",
        "P. 7",
        "P. 8",
        "P. 9",
        "P. 10",
        "P. 11",
        "P. 12",
        "P. 13",
        "P. 14",
      ],
      "Quận 7": [
        "P. Bình Thuận",
        "P. Phú Mỹ",
        "P. Phú Thuận",
        "P. Tân Hưng",
        "P. Tân Kiểng",
        "P. Tân Phong",
        "P. Tân Phú",
        "P. Tân Quy",
      ],
      "Bình Thạnh": [
        "P. 1",
        "P. 2",
        "P. 3",
        "P. 5",
        "P. 6",
        "P. 7",
        "P. 11",
        "P. 12",
        "P. 13",
        "P. 14",
        "P. 15",
        "P. 17",
        "P. 19",
        "P. 21",
        "P. 22",
        "P. 24",
        "P. 25",
        "P. 26",
        "P. 27",
        "P. 28",
      ],
      "Thủ Đức": [
        "P. An Khánh",
        "P. An Lợi Đông",
        "P. An Phú",
        "P. Bình Chiểu",
        "P. Bình Thọ",
        "P. Hiệp Bình Chánh",
        "P. Hiệp Bình Phước",
        "P. Linh Chiểu",
        "P. Linh Đông",
        "P. Linh Tây",
        "P. Linh Trung",
        "P. Linh Xuân",
      ],
    },
    "Hà Nội": {
      "Ba Đình": [
        "P. Cống Vị",
        "P. Điện Biên",
        "P. Đội Cấn",
        "P. Giảng Võ",
        "P. Kim Mã",
        "P. Liễu Giai",
        "P. Ngọc Hà",
        "P. Ngọc Khánh",
        "P. Nguyễn Trung Trực",
        "P. Phúc Xá",
        "P. Quán Thánh",
        "P. Thành Công",
        "P. Trúc Bạch",
        "P. Vĩnh Phúc",
      ],
      "Hoàn Kiếm": [
        "P. Chương Dương",
        "P. Cửa Đông",
        "P. Cửa Nam",
        "P. Đồng Xuân",
        "P. Hàng Bạc",
        "P. Hàng Bài",
        "P. Hàng Bồ",
        "P. Hàng Buồm",
        "P. Hàng Đào",
        "P. Hàng Gai",
        "P. Hàng Mã",
        "P. Hàng Trống",
        "P. Lý Thái Tổ",
        "P. Phan Chu Trinh",
        "P. Phúc Tân",
        "P. Tràng Tiền",
      ],
      "Đống Đa": [
        "P. Cát Linh",
        "P. Hàng Bột",
        "P. Khâm Thiên",
        "P. Kim Liên",
        "P. Láng Hạ",
        "P. Láng Thượng",
        "P. Nam Đồng",
        "P. Ngã Tư Sở",
        "P. Ô Chợ Dừa",
        "P. Phương Liên",
        "P. Phương Mai",
        "P. Quốc Tử Giám",
        "P. Thịnh Quang",
        "P. Thổ Quan",
        "P. Trung Liệt",
        "P. Trung Phụng",
        "P. Văn Chương",
        "P. Văn Miếu",
      ],
      "Cầu Giấy": [
        "P. Dịch Vọng",
        "P. Dịch Vọng Hậu",
        "P. Mai Dịch",
        "P. Nghĩa Đô",
        "P. Nghĩa Tân",
        "P. Quan Hoa",
        "P. Trung Hòa",
        "P. Yên Hòa",
      ],
    },
    "Đà Nẵng": {
      "Hải Châu": [
        "P. Bình Hiên",
        "P. Bình Thuận",
        "P. Hải Châu 1",
        "P. Hải Châu 2",
        "P. Hòa Cường Bắc",
        "P. Hòa Cường Nam",
        "P. Hòa Thuận Đông",
        "P. Hòa Thuận Tây",
        "P. Nam Dương",
        "P. Phước Ninh",
        "P. Thạch Thang",
        "P. Thanh Bình",
        "P. Thuận Phước",
      ],
      "Sơn Trà": [
        "P. An Hải Bắc",
        "P. An Hải Đông",
        "P. An Hải Tây",
        "P. Mân Thái",
        "P. Nại Hiên Đông",
        "P. Phước Mỹ",
        "P. Thọ Quang",
      ],
      "Ngũ Hành Sơn": ["P. Hòa Hải", "P. Hòa Quý", "P. Khuê Mỹ", "P. Mỹ An"],
    },
    "Cần Thơ": {
      "Ninh Kiều": [
        "P. An Bình",
        "P. An Cư",
        "P. An Hội",
        "P. An Lạc",
        "P. An Nghiệp",
        "P. An Phú",
        "P. Cái Khế",
        "P. Hưng Lợi",
        "P. Tân An",
        "P. Thới Bình",
        "P. Xuân Khánh",
      ],
      "Bình Thủy": [
        "P. An Thới",
        "P. Bình Thủy",
        "P. Bùi Hữu Nghĩa",
        "P. Long Hòa",
        "P. Long Tuyền",
        "P. Thới An Đông",
        "P. Trà An",
        "P. Trà Nóc",
      ],
    },
  };
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

  const handleAddAddress = () => {
    if (!validateForm()) return;
    const fullAddress = `${form.street}, ${form.ward}, ${form.district}, ${form.province}`;
    const newAddr: Address = {
      id: Date.now(),
      name: form.name.trim(),
      phone: form.phone.trim(),
      address: fullAddress,
      isDefault: form.setDefault,
    };
    let updated = [...addresses];
    if (form.setDefault) {
      updated = updated.map((a) => ({ ...a, isDefault: false }));
    }
    updated.push(newAddr);
    setAddresses(updated);
    if (form.setDefault) setSelectedAddressId(newAddr.id);
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
  };

  const handleSetDefault = (id: number) => {
    setAddresses(addresses.map((a) => ({ ...a, isDefault: a.id === id })));
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
                      {addr.isDefault && (
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
                    {!addr.isDefault && (
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
                      setWardId(null);
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
                      setWardId(null);
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
                }}
              >
                <Plus size={15} strokeWidth={2.5} />
                Lưu địa chỉ
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
