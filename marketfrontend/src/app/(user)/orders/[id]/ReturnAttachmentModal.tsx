import { API_URL } from "@/helper/api";
import { ReturnRequestAttachment } from "@/types/data/refund/ReuturnRequestAttachment";
import { useQuery } from "@tanstack/react-query";
import React, { CSSProperties, useState } from "react";

const ReturnAttachmentModal = ({
  returnRequestId,
  order,
  setViewReturnMediaShipmentId,
}: {
  returnRequestId: number;
  order: any;
  setViewReturnMediaShipmentId: (id: number | null) => void;
}) => {
  ReturnRequestAttachment.setup({
    path: `${API_URL}/api/refunds-requests-attachments`,
  });

  // Lấy danh sách item từ order (giả sử order.items là mảng các item)
  const items = Array.isArray(order?.items) ? order.items : [];

  // State lưu số lượng hoàn trả cho từng item (key: itemId, value: quantity)
  const [returnQuantities, setReturnQuantities] = useState<
    Record<string, number>
  >(() => {
    const initial: Record<string, number> = {};
    items.forEach((item: any) => {
      initial[item.id] = 0;
    });
    return initial;
  });

  // Xử lý thay đổi số lượng hoàn trả
  const handleQuantityChange = (itemId: string, value: string) => {
    const qty = Math.max(0, Math.min(Number(value) || 0, getMaxQty(itemId)));
    setReturnQuantities((prev) => ({ ...prev, [itemId]: qty }));
  };

  // Lấy số lượng tối đa có thể hoàn trả cho item (giả sử là item.quantity)
  const getMaxQty = (itemId: string) => {
    const item = items.find((it: any) => String(it.id) === String(itemId));
    return item?.quantity || 0;
  };

  const isValidRequestId =
    typeof returnRequestId === "number" && returnRequestId > 0;

  const { data: attachments } = useQuery({
    ...(isValidRequestId
      ? ReturnRequestAttachment.getByReturnRequestId(returnRequestId)
      : { queryKey: ["attachments", "invalid"] }),
    enabled: isValidRequestId,
  });

  //  alert(JSON.stringify(attachments)); // Debugging line to check the attachments data

  const styles: Record<string, CSSProperties> = {
    modalBackdrop: {
      position: "fixed",
      inset: 0,
      background: "rgba(15,23,42,0.52)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 16,
      zIndex: 1050,
    },
    modalCard: {
      width: "100%",
      maxWidth: 880,
      maxHeight: "88vh",
      overflow: "hidden",
      background: "white",
      borderRadius: 18,
      boxShadow: "0 24px 70px rgba(15,23,42,0.22)",
      border: "1px solid rgba(226,232,240,0.9)",
    },
    modalHeader: {
      padding: "18px 22px",
      borderBottom: "1px solid #e2e8f0",
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: 16,
    },
    modalBody: {
      padding: 22,
      overflowY: "auto",
      maxHeight: "calc(88vh - 82px)",
    },
  };

  return (
    <div
      style={styles.modalBackdrop}
      onClick={() => setViewReturnMediaShipmentId(null)}
    >
      <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <h3
            style={{
              fontSize: 20,
              fontWeight: 800,
            }}
          >
            Yêu cầu trả hàng - Hình ảnh & Video {returnRequestId}
          </h3>
          <button
            type="button"
            className="btn btn-light border"
            onClick={() => setViewReturnMediaShipmentId(null)}
          >
            Đóng
          </button>
        </div>
        <div style={styles.modalBody}>
          <div>
            <h4 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>
              Hình ảnh & Video đính kèm
            </h4>
            {attachments?.map((attachment) => (
              <div key={attachment.id}>
                <a
                  href={attachment.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {attachment.description}
                </a>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 32 }}>
            <h4 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>
              Chỉnh số lượng hoàn trả cho từng sản phẩm
            </h4>
            {items.length === 0 && <div>Không có sản phẩm trong đơn hàng.</div>}
            {items.map((item: any) => (
              <div
                key={item.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 10,
                }}
              >
                <img
                  src={
                    item.productImage ||
                    item.image ||
                    "/placeholder-product.png"
                  }
                  alt={item.productName}
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 6,
                    objectFit: "cover",
                    border: "1px solid #eee",
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{item.productName}</div>
                  <div style={{ fontSize: 12, color: "#64748b" }}>
                    SKU: {item.sku || item.id}
                  </div>
                  <div style={{ fontSize: 12, color: "#64748b" }}>
                    Số lượng đã mua: {item.quantity}
                  </div>
                </div>
                <input
                  type="number"
                  min={0}
                  max={getMaxQty(item.id)}
                  value={returnQuantities[item.id] ?? 0}
                  onChange={(e) =>
                    handleQuantityChange(item.id, e.target.value)
                  }
                  style={{
                    width: 60,
                    padding: 4,
                    borderRadius: 4,
                    border: "1px solid #cbd5e1",
                  }}
                />
                <span style={{ fontSize: 12, color: "#64748b" }}>
                  / {getMaxQty(item.id)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReturnAttachmentModal;
