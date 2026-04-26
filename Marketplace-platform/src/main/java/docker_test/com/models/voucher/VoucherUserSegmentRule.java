package docker_test.com.models.voucher;

public class VoucherUserSegmentRule {

	private Long id;
	private Long voucherId;
	private String segmentType;
	private String segmentValue;

	// ===== Constructor =====
	public VoucherUserSegmentRule() {
	}

	public VoucherUserSegmentRule(Long id, Long voucherId, String segmentType, String segmentValue) {
		this.id = id;
		this.voucherId = voucherId;
		this.segmentType = segmentType;
		this.segmentValue = segmentValue;
	}

	// ===== Getter / Setter =====
	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public Long getVoucherId() {
		return voucherId;
	}

	public void setVoucherId(Long voucherId) {
		this.voucherId = voucherId;
	}

	public String getSegmentType() {
		return segmentType;
	}

	public void setSegmentType(String segmentType) {
		this.segmentType = segmentType;
	}

	public String getSegmentValue() {
		return segmentValue;
	}

	public void setSegmentValue(String segmentValue) {
		this.segmentValue = segmentValue;
	}
}