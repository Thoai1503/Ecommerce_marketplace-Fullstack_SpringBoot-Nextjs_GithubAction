import { API_URL } from "@/helper/api";
import { Order } from "@/types";
import { ReturnRequestAttachment } from "@/types/data/refund/ReuturnRequestAttachment";
import { IReturnRequestAttachment } from "@/validators/returnRequestAttachment";
import { useQuery } from "@tanstack/react-query";
import { CSSProperties, useMemo } from "react";

type OrderShipment = NonNullable<Order["shipments"]>[number];

type ReturnRequestItemView = {
  id: number;
  returnRequestId?: number;
  orderItemId: number;
  quantity: number;
  requestedAmount?: number;
  refundedAmount?: number;
};

type AttachmentView = Partial<IReturnRequestAttachment> & {
  id: number | string;
  fileType?: string;
  file_type?: string;
  file_url?: string;
  file_name?: string;
  url?: string;
};

type ReturnRequestView = {
  id: number;
  status?: string;
  reason?: string | null;
  quantity?: number;
  requestedAmount?: number;
  refundedAmount?: number;
  items?: ReturnRequestItemView[];
  attachments?: AttachmentView[];
};

type DisplayReturnItem = {
  requestItem?: ReturnRequestItemView;
  product?: OrderShipment["items"][number];
  checked: boolean;
  quantity: number;
  estimatedAmount: number;
};

const formatMoney = (amount?: number) =>
  `${Number(amount || 0).toLocaleString("vi-VN")}d`;

const getAttachmentUrl = (attachment: AttachmentView) =>
  attachment.fileUrl || attachment.file_url || attachment.url || "";

const getAttachmentName = (attachment: AttachmentView) =>
  attachment.description ||
  attachment.fileName ||
  attachment.file_name ||
  getAttachmentUrl(attachment);

const isImageAttachment = (attachment: AttachmentView) => {
  const fileUrl = getAttachmentUrl(attachment);
  const fileType = (attachment.fileType || attachment.file_type || "")
    .toString()
    .toLowerCase();

  return (
    fileType.includes("image") ||
    /\.(jpg|jpeg|png|gif|webp|bmp)(\?.*)?$/i.test(fileUrl)
  );
};

const isVideoAttachment = (attachment: AttachmentView) => {
  const fileUrl = getAttachmentUrl(attachment);
  const fileType = (attachment.fileType || attachment.file_type || "")
    .toString()
    .toLowerCase();

  return (
    fileType.includes("video") ||
    /\.(mp4|mov|avi|webm|mkv)(\?.*)?$/i.test(fileUrl)
  );
};

const ReturnAttachmentModal = ({
  returnRequestId,
  shipment,
  setViewReturnMediaShipmentId,
}: {
  returnRequestId?: number;
  shipment?: OrderShipment | null;
  setViewReturnMediaShipmentId: (id: number | null) => void;
}) => {
  ReturnRequestAttachment.setup({
    path: `${API_URL}/api/refunds-requests-attachments`,
  });

  const safeReturnRequestId =
    typeof returnRequestId === "number" ? returnRequestId : 0;
  const isValidRequestId = safeReturnRequestId > 0;
  const shipmentId = shipment?.id ? Number(shipment.id) : 0;
  const canLookupReturnRequest = isValidRequestId || shipmentId > 0;

  const {
    data: returnRequest,
    isLoading: isRequestLoading,
    isError: isRequestError,
  } = useQuery<ReturnRequestView>({
    queryKey: ["RETURN_REQUEST_DETAIL_QUERY", safeReturnRequestId, shipmentId],
    queryFn: async () => {
      if (safeReturnRequestId > 0) {
        const response = await fetch(
          `${API_URL}/api/refunds/${safeReturnRequestId}`,
          { credentials: "include" },
        );

        if (response.ok) {
          return response.json();
        }
      }

      if (shipmentId > 0) {
        const response = await fetch(
          `${API_URL}/api/refunds/shipment/${shipmentId}`,
          { credentials: "include" },
        );

        if (response.ok) {
          return response.json();
        }
      }

      throw new Error("Không tải được yêu cầu trả hàng");
    },
    enabled: canLookupReturnRequest,
    retry: false,
  });

  const effectiveReturnRequestId = Number(
    returnRequest?.id || safeReturnRequestId || 0,
  );

  const { data: attachments = [], isLoading } = useQuery({
    queryKey: [
      "RETURN_REQUEST_ATTACHMENTS_BY_RETURN_REQUEST_ID_QUERY",
      effectiveReturnRequestId,
    ],
    queryFn: () =>
      ReturnRequestAttachment.getByReturnRequestId(effectiveReturnRequestId)
        .queryFn()
        .then((items) => items as AttachmentView[]),
    enabled: effectiveReturnRequestId > 0,
  });

  const requestItems = returnRequest?.items || [];
  const visibleAttachments =
    returnRequest?.attachments?.length ? returnRequest.attachments : attachments;
  const fallbackReturnItems = useMemo(
    () =>
      (shipment?.items || []).filter(
        (item) => Number(item.lastReturnRequestId) === effectiveReturnRequestId,
      ),
    [effectiveReturnRequestId, shipment],
  );

  const selectedReturnItems = useMemo<DisplayReturnItem[]>(() => {
    const shipmentItems = shipment?.items || [];

    if (requestItems.length > 0) {
      return requestItems.map((requestItem) => {
        const product = shipmentItems.find(
          (item) => Number(item.id) === Number(requestItem.orderItemId),
        );

        return {
          requestItem,
          product,
          checked: true,
          quantity: requestItem.quantity || 0,
          estimatedAmount: Number(requestItem.requestedAmount || 0),
        };
      });
    }

    const hasMatchedItems = fallbackReturnItems.length > 0;
    const fallbackItems = hasMatchedItems ? fallbackReturnItems : shipmentItems;

    return fallbackItems.map((product) => {
      const orderedQuantity = Math.max(1, Number(product.quantity || 1));
      const totalAfterAllVouchers = Number(product.totalAfterAllVouchers || 0);
      const totalDiscount = Number(
        product.totalVoucherDiscountAmount ?? product.discount ?? 0,
      );
      const estimatedAmount =
        totalAfterAllVouchers > 0
          ? totalAfterAllVouchers
          : Math.max(
              0,
              Number(product.price || 0) * orderedQuantity - totalDiscount,
            );

      return {
        product,
        checked: hasMatchedItems,
        quantity: hasMatchedItems ? orderedQuantity : 0,
        estimatedAmount: hasMatchedItems ? estimatedAmount : 0,
      };
    });
  }, [fallbackReturnItems, requestItems, shipment]);

  const isShowingMatchedFallback =
    requestItems.length === 0 && fallbackReturnItems.length > 0;
  const isShowingShipmentFallback =
    requestItems.length === 0 &&
    fallbackReturnItems.length === 0 &&
    selectedReturnItems.length > 0;
  const displayRequestedAmount =
    returnRequest?.requestedAmount ??
    selectedReturnItems.reduce((sum, item) => sum + item.estimatedAmount, 0);

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
    sectionTitle: {
      fontSize: 16,
      fontWeight: 800,
      marginBottom: 12,
      color: "#1e293b",
    },
    summaryBox: {
      border: "1px solid #fee2e2",
      borderRadius: 12,
      background: "#fff7f7",
      padding: 12,
      marginBottom: 18,
    },
    productCard: {
      border: "1px solid #e2e8f0",
      borderRadius: 10,
      padding: 12,
      background: "white",
      display: "flex",
      gap: 12,
      alignItems: "center",
    },
    productImage: {
      width: 54,
      height: 54,
      borderRadius: 8,
      objectFit: "cover",
      border: "1px solid #e2e8f0",
      background: "#f8fafc",
      flexShrink: 0,
    },
    attachmentCard: {
      border: "1px solid #e2e8f0",
      borderRadius: 10,
      background: "#f8fafc",
      padding: 10,
      minWidth: 0,
    },
  };

  return (
    <div
      style={styles.modalBackdrop}
      onClick={() => setViewReturnMediaShipmentId(null)}
    >
      <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
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
            <h3
              className="mb-1"
              style={{
                fontSize: 22,
                fontWeight: 800,
              }}
            >
              Xem yêu cầu trả hàng #{effectiveReturnRequestId || ""}
            </h3>
            <p className="mb-0 text-muted" style={{ fontSize: 13 }}>
              San pham da chon tra, ly do va hinh anh/video bang chung.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-light border"
            onClick={() => setViewReturnMediaShipmentId(null)}
          >
            Đóng
          </button>
        </div>
        <div style={styles.modalBody}>
          {!canLookupReturnRequest && (
            <div className="text-muted">
              Chua tim thay ma yeu cau tra hang cho kien nay.
            </div>
          )}

          {canLookupReturnRequest && (
            <>
              <div style={styles.summaryBox}>
                <div className="d-flex flex-wrap justify-content-between gap-3">
                  <div>
                    <p className="mb-1" style={{ fontSize: 12, fontWeight: 800 }}>
                      Kien hang: {shipment?.tracking_number || shipment?.id || "-"}
                    </p>
                    <p className="mb-0 text-muted" style={{ fontSize: 12 }}>
                      Trang thai:{" "}
                      {returnRequest?.status ||
                        shipment?.returnStatusSummary ||
                        "Dang cap nhat"}
                    </p>
                  </div>
                  <div className="text-end">
                    <p className="mb-1 text-muted" style={{ fontSize: 12 }}>
                      So tien yeu cau
                    </p>
                    <p
                      className="mb-0"
                      style={{ fontSize: 16, fontWeight: 800, color: "#dc2626" }}
                    >
                      {formatMoney(displayRequestedAmount)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <h4 style={styles.sectionTitle}>
                  {isShowingShipmentFallback
                    ? "San pham trong kien hang"
                    : "San pham da chon tra"}
                </h4>
                {isRequestLoading && <div>Dang tai san pham tra hang...</div>}
                {isShowingMatchedFallback && (
                  <div className="text-muted mb-2" style={{ fontSize: 12 }}>
                    Dang hien san pham co ma yeu cau tra hang trung voi kien nay.
                  </div>
                )}
                {isShowingShipmentFallback && (
                  <div className="text-muted mb-2" style={{ fontSize: 12 }}>
                    Chua xac dinh duoc item nao da tra tu API, danh sach duoi
                    day chi de doi chieu kien hang.
                  </div>
                )}
                {isRequestError && selectedReturnItems.length === 0 && (
                  <div className="text-muted">
                    Khong tai duoc chi tiet yeu cau, vui long thu lai sau.
                  </div>
                )}
                {!isRequestLoading &&
                  !isRequestError &&
                  selectedReturnItems.length === 0 && (
                    <div className="text-muted">
                      Chua co du lieu san pham trong yeu cau nay.
                    </div>
                  )}
                <div className="d-flex flex-column gap-2">
                  {selectedReturnItems.map((displayItem) => {
                    const { requestItem, product } = displayItem;
                    const key = requestItem?.id ?? product?.id ?? product?.sku;
                    const displayQuantity =
                      requestItem?.quantity ?? displayItem.quantity;
                    const displayAmount =
                      requestItem?.requestedAmount ?? displayItem.estimatedAmount;

                    return (
                      <div key={key} style={styles.productCard}>
                        <input
                          type="checkbox"
                          checked={displayItem.checked}
                          readOnly
                        />

                        {product?.productImage && (
                          <img
                            src={product.productImage}
                            alt={product.productName}
                            style={styles.productImage}
                          />
                        )}

                        <div style={{ minWidth: 0, flex: 1 }}>
                          <p
                            className="mb-1"
                            style={{
                              fontSize: 13,
                              fontWeight: 800,
                              color: "#0f172a",
                            }}
                          >
                            {product?.productName ||
                              `San pham #${requestItem?.orderItemId || "-"}`}
                          </p>
                          <p className="mb-0 text-muted" style={{ fontSize: 11 }}>
                            {product?.variant ? `${product.variant} | ` : ""}
                            SKU: {product?.sku || "-"}
                          </p>
                        </div>

                        <div className="text-end" style={{ minWidth: 150 }}>
                          <p
                            className="mb-1"
                            style={{
                              fontSize: 12,
                              fontWeight: 800,
                              color: "#137fec",
                            }}
                          >
                            {formatMoney(product?.price)}
                          </p>
                          <div className="d-inline-flex align-items-center gap-1">
                            <input
                              type="number"
                              value={displayQuantity}
                              readOnly
                              style={{
                                width: 64,
                                padding: "3px 6px",
                                borderRadius: 6,
                                border: "1px solid #cbd5e1",
                                fontSize: 12,
                                textAlign: "center",
                                background: "#f8fafc",
                              }}
                            />
                            <span style={{ fontSize: 11, color: "#64748b" }}>
                              / {product?.quantity || displayQuantity || 1}
                            </span>
                          </div>
                          <div
                            style={{
                              fontSize: 11,
                              color: "#64748b",
                              marginTop: 4,
                            }}
                          >
                            Tam tinh hoan: {formatMoney(displayAmount)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mb-4">
                <h4 style={styles.sectionTitle}>Ly do tra hang</h4>
                <textarea
                  value={returnRequest?.reason || ""}
                  readOnly
                  style={{
                    width: "100%",
                    minHeight: 86,
                    borderRadius: 10,
                    border: "1px solid #cbd5e1",
                    padding: 12,
                    fontSize: 13,
                    color: "#0f172a",
                    resize: "vertical",
                    outline: "none",
                    background: "#f8fafc",
                  }}
                />
              </div>

              <div>
                <h4 style={styles.sectionTitle}>Hinh anh / Video bang chung</h4>
                {isLoading && <div>Dang tai tep dinh kem...</div>}
                {!isLoading && visibleAttachments.length === 0 && (
                  <div className="text-muted">
                    Khong co hinh anh hoac video dinh kem.
                  </div>
                )}
                {!isLoading && visibleAttachments.length > 0 && (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fill, minmax(150px, 1fr))",
                      gap: 12,
                    }}
                  >
                    {visibleAttachments.map((attachment) => {
                      const fileUrl = getAttachmentUrl(attachment);
                      return (
                        <div key={attachment.id} style={styles.attachmentCard}>
                          {isImageAttachment(attachment) && (
                            <img
                              src={fileUrl}
                              alt={getAttachmentName(attachment)}
                              style={{
                                width: "100%",
                                aspectRatio: "1 / 1",
                                objectFit: "cover",
                                borderRadius: 8,
                                marginBottom: 6,
                                background: "#e2e8f0",
                              }}
                            />
                          )}
                          {isVideoAttachment(attachment) && (
                            <video
                              src={fileUrl}
                              controls
                              style={{
                                width: "100%",
                                aspectRatio: "1 / 1",
                                objectFit: "cover",
                                borderRadius: 8,
                                marginBottom: 6,
                                background: "#000",
                              }}
                            >
                              Trinh duyet khong ho tro video.
                            </video>
                          )}
                          {!isImageAttachment(attachment) &&
                            !isVideoAttachment(attachment) && (
                              <a
                                href={fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ fontSize: 12, wordBreak: "break-word" }}
                              >
                                {getAttachmentName(attachment)}
                              </a>
                            )}
                          {(isImageAttachment(attachment) ||
                            isVideoAttachment(attachment)) && (
                            <a
                              href={fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                display: "block",
                                fontSize: 12,
                                wordBreak: "break-word",
                              }}
                            >
                              {getAttachmentName(attachment)}
                            </a>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReturnAttachmentModal;
