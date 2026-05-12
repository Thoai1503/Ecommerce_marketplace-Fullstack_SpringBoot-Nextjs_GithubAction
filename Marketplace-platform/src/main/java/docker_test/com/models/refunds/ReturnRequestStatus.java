package docker_test.com.models.refunds;

public enum ReturnRequestStatus {
	PENDING_APPROVAL("Đang chờ phê duyệt")	,
	APPROVED("Đã phê duyệt"),
	REJECTED("Đã từ chối"),
	SHIPPING("Đang vận chuyển hàng trả lại"),
	RECEIVED("Đã nhận hàng trả lại"),
	REFUNDED("Đã hoàn tiền"),
	INSPECTION_PASSED("Đã kiểm tra - Đạt"),
	INSPECTION_FAILED("Đã kiểm tra - Không đạt"),
	CANCELLED("Đã hủy");
	
	private final String description;

	
	ReturnRequestStatus(String description) {
		this.description = description;
	}

	public static ReturnRequestStatus fromValue(String value) {
		String normalized = value == null ? "" : value.trim().toUpperCase();
		if ("CANCELED".equals(normalized)) {
			return CANCELLED;
		}
		return ReturnRequestStatus.valueOf(normalized);
	}
}
