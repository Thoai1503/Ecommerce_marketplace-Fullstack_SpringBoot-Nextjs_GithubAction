package docker_test.com.models;

import java.time.LocalDateTime;

public final class Address {
    private long address_id;
    private long user_id;
    private String recipient_name;
    private String recipient_phone;
    private String address_line;
    private String ward;
    private String district;
    private String city;
    private String postal_code;
    private int is_default;
    private LocalDateTime created_at;
    private LocalDateTime updated_at;

    public Address() {
        this.is_default = 0;
        this.created_at = LocalDateTime.now();
        this.updated_at = LocalDateTime.now();
    }

    public Address(long address_id, long user_id, String recipient_name, String recipient_phone,
                   String address_line, String ward, String district, String city,
                   String postal_code, int is_default, LocalDateTime created_at,
                   LocalDateTime updated_at) {
        this.address_id = address_id;
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

    public long getAddressId() {
        return address_id;
    }

    public void setAddressId(long address_id) {
        this.address_id = address_id;
    }

    public long getUserId() {
        return user_id;
    }

    public void setUserId(long user_id) {
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
        return postal_code;
    }

    public void setPostalCode(String postal_code) {
        this.postal_code = postal_code;
    }

    public int isDefault() {
        return is_default;
    }

    public void setDefault(int is_default) {
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