package docker_test.com.models.voucher;

import java.time.LocalDateTime;

public class VoucherScopeRule {

	private Long id;
	private Long voucherId;
	private String scopeType;
	private Long scopeId;
	private String includeExclude;
	private LocalDateTime createdAt;

	// ===== Constructor =====
	public VoucherScopeRule() {
	}

	public VoucherScopeRule(Long id, Long voucherId, String scopeType, Long scopeId, String includeExclude,
			LocalDateTime createdAt) {
		this.id = id;
		this.voucherId = voucherId;
		this.scopeType = scopeType;
		this.scopeId = scopeId;
		this.includeExclude = includeExclude;
		this.createdAt = createdAt;
	}

	// ===== Getters & Setters =====

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

	public String getScopeType() {
		return scopeType;
	}

	public void setScopeType(String scopeType) {
		this.scopeType = scopeType;
	}

	public Long getScopeId() {
		return scopeId;
	}

	public void setScopeId(Long scopeId) {
		this.scopeId = scopeId;
	}

	public String getIncludeExclude() {
		return includeExclude;
	}

	public void setIncludeExclude(String includeExclude) {
		this.includeExclude = includeExclude;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}
}