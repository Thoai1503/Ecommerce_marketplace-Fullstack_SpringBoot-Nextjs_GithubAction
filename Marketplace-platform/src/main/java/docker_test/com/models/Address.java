package docker_test.com.models;

import java.time.LocalDateTime;

public final class Address {
    private Long address_id;
    private Long user_id;
    public Long getShop_id() {
		return shop_id;
	}

	public void setShop_id(Long shop_id) {
		this.shop_id = shop_id;
	}

	private Long shop_id;
    private String recipient_name;
    private String recipient_phone;
    private String address_line;
    private Long ward;
    private Long district;
    private Long city;
    private String postal_code;
    public int getIsDefault() {
		return is_default;
	}

	public void setIsDefault(Integer is_default) {
		this.is_default = is_default;
	}

	private Integer is_default;
    private LocalDateTime created_at;
    private LocalDateTime updated_at;

    public Address() {
        this.is_default = 0;
        this.created_at = LocalDateTime.now();
        this.updated_at = LocalDateTime.now();
    }

    public Address(Long address_id, Long user_id, Long shop_id, String recipient_name, String recipient_phone,
                   String address_line, Long ward, Long district, Long city,
                   String postal_code, Integer is_default, LocalDateTime created_at,
                   LocalDateTime updated_at) {
        this.address_id = address_id;
        this.shop_id = shop_id;
        this.user_id = user_id;
        this.recipient_name = recipient_name;
        this.recipient_phone = recipient_phone;
        this.address_line = address_line;
        this.ward = ward;
        this.district = district;
        this.city = city;
        this.postal_code = postal_code;
        this.is_default = is_default;
        this.created_at = created_at;
        this.updated_at = updated_at;
    }

    public Long getAddressId() {
        return address_id;
    }

    public void setAddressId(Long address_id) {
        this.address_id = address_id;
    }

    public Long getUserId() {
        return user_id;
    }

    public void setUserId(Long user_id) {
        this.user_id = user_id;
    }

    public String getRecipientName() {
        return recipient_name;
    }

    public void setRecipientName(String recipient_name) {
        this.recipient_name = recipient_name;
    }

    public String getRecipientPhone() {
        return recipient_phone;
    }

    public void setRecipientPhone(String recipient_phone) {
        this.recipient_phone = recipient_phone;
    }

    public String getAddressLine() {
        return address_line;
    }

    public void setAddressLine(String address_line) {
        this.address_line = address_line;
    }

    public Long getWard() {
        return ward;
    }

    public void setWard(Long ward) {
        this.ward = ward;
    }

    public Long getDistrict() {
        return district;
    }

    public void setDistrict(Long district) {
        this.district = district;
    }

    public Long getCity() {
        return city;
    }

    public void setCity(Long city) {
        this.city = city;
    }

    public String getPostalCode() {
        return postal_code;
    }

    public void setPostalCode(String postal_code) {
        this.postal_code = postal_code;
    }

    public int isDefault() {
        return is_default;
    }

    public void setDefault(Integer is_default) {
        this.is_default = is_default;
    }

    public LocalDateTime getCreatedAt() {
        return created_at;
    }

    public void setCreatedAt(LocalDateTime created_at) {
        this.created_at = created_at;
    }

    public LocalDateTime getUpdatedAt() {
        return updated_at;
    }

    public void setUpdatedAt(LocalDateTime updated_at) {
        this.updated_at = updated_at;
    }
}