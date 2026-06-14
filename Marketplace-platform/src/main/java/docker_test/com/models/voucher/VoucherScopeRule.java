package docker_test.com.models.voucher;

import java.time.LocalDateTime;

import docker_test.com.models.Brand;
import docker_test.com.models.Category;

public class VoucherScopeRule {

	private Long id;
	private Long voucherId;
	private String scopeType;
	private Long scopeId;
	private String includeExclude;
	private Category category;
	private Brand brand;
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

	public Category getCategory() {
		return category;
	}

	public void setCategory(Category category) {
		this.category = category;
	}

	public Brand getBrand() {
		return brand;
	}

	public void setBrand(Brand brand) {
		this.brand = brand;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}
}