import { CSSProperties, MouseEvent } from "react";

import { Order } from "@/types";

export type ReturnRequestDraft = {
  selectedItemIds: Record<string, boolean>;
  reason: string;
  files: File[];
  // Thêm số lượng hoàn trả cho từng item
  returnQuantities: Record<string, number>;
};

type OrderShipment = NonNullable<Order["shipments"]>[number];

export type ReturnRequestAttachment = {
  id: number | string;
  fileUrl: string;
  fileType?: string; // 'IMAGE', 'VIDEO', ...
  description?: string;
};

type ReturnRequestModalProps = {
  shipment: OrderShipment;
  draft?: ReturnRequestDraft;
  status?: "idle" | "pending" | "submitted";
  attachments?: ReturnRequestAttachment[];
  onClose: () => void;
  onToggleItem: (itemId: number, checked: boolean) => void;
  onQuantityChange: (itemId: number, quantity: number) => void;
  onReasonChange: (reason: string) => void;
  onFilesChange: (files: FileList | null) => void;
  onRemoveFile: (fileIndex: number) => void;
  onSubmit: () => void;
  formatMoney: (amount: number) => string;
  styles: {
    modalBackdrop: CSSProperties;
    modalCard: CSSProperties;
    modalHeader: CSSProperties;
    modalBody: CSSProperties;
    productImg: CSSProperties;
    qtyBadge: CSSProperties;
    reviewTextarea: CSSProperties;
  };
};

export default function ReturnRequestModal({
  shipment,
  draft,
  status = "idle",
  attachments = [],
  onClose,
  onToggleItem,
  onQuantityChange,
  onReasonChange,
  onFilesChange,
  onRemoveFile,
  onSubmit,
  formatMoney,
  styles,
}: ReturnRequestModalProps) {
  const handleSubmitClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    onSubmit();
  };

  return (
    <div style={styles.modalBackdrop} onClick={onClose}>
      <div
        style={styles.modalCard}
        onClick={(event) => event.stopPropagation()}
      >
        <div style={styles.modalHeader}>
          <div>
            <p
              className="mb-1"
              style={{
                fontSize: 11,
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "#dc2626",
              }}
            >
              Tra hang hoan tien
            </p>
            <h3 className="mb-1" style={{ fontSize: 22, fontWeight: 800 }}>
              Tao yeu cau tra hang
            </h3>
            <p className="mb-0 text-muted" style={{ fontSize: 13 }}>
              Chon san pham trong kien, dien ly do va tai len hinh anh/video de
              lam bang chung.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-light border"
            disabled={status === "pending"}
          >
            Dong
          </button>
        </div>

        <div style={styles.modalBody}>
          {status === "pending" && (
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "rgba(0, 0, 0, 0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 9999,
              }}
            >
              <div
                style={{
                  background: "white",
                  borderRadius: 16,
                  padding: 32,
                  textAlign: "center",
                  boxShadow: "0 10px 40px rgba(0, 0, 0, 0.2)",
                }}
              >
                <div
                  style={{
                    width: 50,
                    height: 50,
                    border: "4px solid #f0f0f0",
                    borderTop: "4px solid #dc2626",
                    borderRadius: "50%",
                    margin: "0 auto 16px",
                    animation: "spin 1s linear infinite",
                  }}
                />
                <p
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                    marginBottom: 8,
                    color: "#1f2937",
                  }}
                >
                  Dang tai len file...
                </p>
                <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 0 }}>
                  Vui long cho trong khi chung toi xu ly anh/video cua ban
                </p>
                <style>{`
                  @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                  }
                `}</style>
              </div>
            </div>
          )}
          <div
            className="mb-3"
            style={{
              border: "1px solid #fee2e2",
              borderRadius: 12,
              background: "#fff7f7",
              padding: 12,
            }}
          >
            <p className="mb-1" style={{ fontSize: 12, fontWeight: 700 }}>
              Kien hang: {shipment.tracking_number || shipment.id}
            </p>
            <p className="mb-0 text-muted" style={{ fontSize: 12 }}>
              Vui long danh dau cac san pham ban muon tra trong kien hang nay.
            </p>
            {attachments.length > 0 && (
              <div className="mt-3">
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 12,
                    color: "#dc2626",
                    marginBottom: 6,
                  }}
                >
                  File đính kèm từ hệ thống:
                </div>
                <div className="d-flex flex-wrap gap-3">
                  {attachments.map((att) => {
                    const isImage =
                      att.fileType?.toLowerCase().includes("image") ||
                      /\.(jpg|jpeg|png|gif|webp)$/i.test(att.fileUrl);
                    const isVideo =
                      att.fileType?.toLowerCase().includes("video") ||
                      /\.(mp4|mov|avi|webm|mkv)$/i.test(att.fileUrl);
                    return (
                      <div key={att.id} style={{ maxWidth: 160 }}>
                        {isImage && (
                          <img
                            src={att.fileUrl}
                            alt={att.description || "evidence"}
                            style={{
                              width: "100%",
                              borderRadius: 8,
                              marginBottom: 4,
                              objectFit: "cover",
                            }}
                          />
                        )}
                        {isVideo && (
                          <video
                            src={att.fileUrl}
                            controls
                            style={{
                              width: "100%",
                              borderRadius: 8,
                              marginBottom: 4,
                              background: "#000",
                            }}
                          >
                            Trinh duyet khong ho tro video.
                          </video>
                        )}
                        {!isImage && !isVideo && (
                          <a
                            href={att.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ fontSize: 12 }}
                          >
                            {att.fileUrl}
                          </a>
                        )}
                        {att.description && (
                          <div style={{ fontSize: 11, color: "#64748b" }}>
                            {att.description}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="d-flex flex-column gap-2 mb-4">
            {shipment.items.map((item) => {
              const checked = !!draft?.selectedItemIds?.[item.id];
              const maxQty = item.quantity || 1;
              const value = draft?.returnQuantities?.[item.id] ?? 0;
              return (
                <label
                  key={`${shipment.id}-return-${item.id}`}
                  className="d-flex gap-3 align-items-center"
                  style={{
                    border: checked ? "1px solid #fca5a5" : "1px solid #e2e8f0",
                    borderRadius: 10,
                    padding: 12,
                    background: checked ? "#fff1f2" : "white",
                    cursor: "pointer",
                    opacity: status === "pending" ? 0.6 : 1,
                    pointerEvents: status === "pending" ? "none" : "auto",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(event) =>
                      onToggleItem(Number(item.id), event.target.checked)
                    }
                    disabled={status === "pending"}
                  />

                  <img
                    src={item.productImage}
                    alt={item.productName}
                    style={{
                      ...styles.productImg,
                      width: 52,
                      height: 52,
                    }}
                  />

                  <div className="flex-grow-1">
                    <p
                      className="mb-1"
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: "#0f172a",
                      }}
                    >
                      {item.productName}
                    </p>
                    <p className="mb-0 text-muted" style={{ fontSize: 11 }}>
                      {item.variant ? `${item.variant} | ` : ""}SKU: {item.sku}
                    </p>
                  </div>

                  <div className="text-end" style={{ minWidth: 120 }}>
                    <p
                      className="mb-1"
                      style={{
                        fontSize: 12,
                        fontWeight: 800,
                        color: "#137fec",
                      }}
                    >
                      {formatMoney(item.price)}
                    </p>
                    <span style={styles.qtyBadge}>SL: {item.quantity}</span>
                    {checked && (
                      <div style={{ marginTop: 6 }}>
                        <input
                          type="number"
                          min={1}
                          max={maxQty}
                          value={value}
                          onChange={(e) => {
                            let v = Math.max(
                              1,
                              Math.min(Number(e.target.value) || 1, maxQty),
                            );
                            // Nếu bỏ chọn thì không cho nhập
                            if (!checked) v = 0;
                            onQuantityChange(Number(item.id), v);
                          }}
                          disabled={status === "pending"}
                          style={{
                            width: 60,
                            padding: 2,
                            borderRadius: 4,
                            border: "1px solid #cbd5e1",
                            marginLeft: 8,
                            fontSize: 12,
                          }}
                        />
                        <span
                          style={{
                            fontSize: 11,
                            color: "#64748b",
                            marginLeft: 4,
                          }}
                        >
                          / {maxQty}
                        </span>
                      </div>
                    )}
                  </div>
                </label>
              );
            })}
          </div>

          <div className="mb-4">
            <label
              className="mb-2 d-block"
              style={{ fontSize: 12, fontWeight: 700, color: "#334155" }}
            >
              Ly do tra hang hoan tien
            </label>
            <textarea
              value={draft?.reason || ""}
              onChange={(event) => onReasonChange(event.target.value)}
              style={styles.reviewTextarea}
              disabled={status === "pending"}
              placeholder="Mo ta tinh trang san pham, loi gap phai, va yeu cau hoan tien cua ban..."
            />
          </div>

          <div className="mb-2">
            <label
              className="mb-2 d-block"
              style={{ fontSize: 12, fontWeight: 700, color: "#334155" }}
            >
              Hinh anh / Video bang chung (toi da 10 tep)
            </label>
            <input
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={(event) => onFilesChange(event.target.files)}
              disabled={status === "pending"}
              className="form-control"
            />
            <p className="text-muted mt-2 mb-2" style={{ fontSize: 11 }}>
              Khuyen nghi: quay video mo hop hoac chup ro loi san pham de tang
              kha nang duoc phe duyet nhanh.
            </p>

            {!!draft?.files?.length && (
              <div className="d-flex flex-column gap-2">
                {draft.files.map((file, index) => (
                  <div
                    key={`${shipment.id}-evidence-${index}`}
                    className="d-flex align-items-center justify-content-between"
                    style={{
                      border: "1px solid #e2e8f0",
                      borderRadius: 8,
                      padding: "8px 10px",
                      background: "#f8fafc",
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <p
                        className="mb-0"
                        style={{ fontSize: 12, fontWeight: 600 }}
                      >
                        {file.name}
                      </p>
                      <p className="mb-0 text-muted" style={{ fontSize: 11 }}>
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => onRemoveFile(index)}
                    >
                      Xoa
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="d-flex flex-wrap justify-content-end gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-light border px-4"
            >
              Huy
            </button>
            <button
              type="button"
              onClick={handleSubmitClick}
              disabled={status === "pending"}
              className="btn btn-danger px-4"
            >
              {status === "pending"
                ? "Dang gui yeu cau..."
                : "Gui yeu cau tra hang"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
