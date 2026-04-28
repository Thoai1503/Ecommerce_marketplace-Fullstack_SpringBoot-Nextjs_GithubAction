import { API_URL } from "@/helper/api";
import { ReturnRequestAttachment } from "@/types/data/refund/ReuturnRequestAttachment";
import { useQuery } from "@tanstack/react-query";
import React, { CSSProperties } from "react";

const ReturnAttachmentModal = ({
  returnRequestId,
  order,
  setViewReturnMediaShipmentId,
}: {
  returnRequestId: number;
  order: any;
  setViewReturnMediaShipmentId: (id: number | null) => void;
}) => {
  console.log("ReturnAttachmentModal - returnRequestId:", returnRequestId);
  ReturnRequestAttachment.setup({
    path: `${API_URL}/api/refunds-requests-attachments`,
  });
  const { data: attachments } = useQuery(
    ReturnRequestAttachment.getByReturnRequestId(returnRequestId || -1),
  );

  console.log("ReturnAttachmentModal - attachments:", attachments);
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
            Yêu cầu trả hàng - Hình ảnh & Video
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
          {(() => {
            if (!returnRequestId) {
              return (
                <p className="text-muted">
                  Không tìm thấy yêu cầu trả hàng nào liên quan đến đơn hàng
                  này.
                </p>
              );
            }

            return (
              <>
                {attachments?.length === 0 ? (
                  <p className="text-muted">Không có tệp đính kèm nào.</p>
                ) : (
                  <div>
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
                )}
              </>
            );
          })()}
        </div>
      </div>
    </div>
  );
};

export default ReturnAttachmentModal;
