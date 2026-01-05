package docker_test.com.models;

import java.time.LocalDateTime;

public final class Address {
	private long addressId;
	private long userId;
	private String recipientName;
	private String recipientPhone;
	private String addressLine;
	private String ward;
	private String district;
	private String city;
	private String postalCode;
	private int isDefault;
	private LocalDateTime createdAt;
	private LocalDateTime updatedAt;

	public Address() {
		this.isDefault = 0;
		this.createdAt = LocalDateTime.now();
		this.updatedAt = LocalDateTime.now();
	}

	public Address(long addressId, long userId, String recipientName, String recipientPhone, String addressLine,
			String ward, String district, String city, String postalCode, int isDefault, LocalDateTime createdAt,
			LocalDateTime updatedAt) {
		this.addressId = addressId;
		this.userId = userId;
		this.recipientName = recipientName;
		this.recipientPhone = recipientPhone;
		this.addressLine = addressLine;
		this.ward = ward;
		this.district = district;
		this.city = city;
		this.postalCode = postalCode;
		this.isDefault = isDefault;
		this.createdAt = createdAt;
		this.updatedAt = updatedAt;
	}

	// Getters and Setters
	public long getAddressId() {
		return addressId;
	}

	public void setAddressId(long addressId) {
		this.addressId = addressId;
	}

	public long getUserId() {
		return userId;
	}

	public void setUserId(long userId) {
		this.userId = userId;
	}

	public String getRecipientName() {
		return recipientName;
	}

	public void setRecipientName(String recipientName) {
		this.recipientName = recipientName;
	}

	public String getRecipientPhone() {
		return recipientPhone;
	}

	public void setRecipientPhone(String recipientPhone) {
		this.recipientPhone = recipientPhone;
	}

	public String getAddressLine() {
		return addressLine;
	}

	public void setAddressLine(String addressLine) {
		this.addressLine = addressLine;
	}

	public String getWard() {
		return ward;
	}

	public void setWard(String ward) {
		this.ward = ward;
	}

	public String getDistrict() {
		return district;
	}

	public void setDistrict(String district) {
		this.district = district;
	}

	public String getCity() {
		return city;
	}

	public void setCity(String city) {
		this.city = city;
	}

	public String getPostalCode() {
		return postalCode;
	}

	public void setPostalCode(String postalCode) {
		this.postalCode = postalCode;
	}

	public int isDefault() {
		return isDefault;
	}

	public void setDefault(int aDefault) {
		isDefault = aDefault;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}

	public LocalDateTime getUpdatedAt() {
		return updatedAt;
	}

	public void setUpdatedAt(LocalDateTime updatedAt) {
		this.updatedAt = updatedAt;
	}
}
