package logistic_service.com.models;

public class Recipient{

	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public String getPhone() {
		return phone;
	}
	public void setPhone(String phone) {
		this.phone = phone;
	}
	public String getAddress() {
		return address;
	}
	public void setAddress(String address) {
		this.address = address;
	}
	public Long getProvince() {
		return province;
	}
	public void setProvince(Long province) {
		this.province = province;
	}
	public Long getDistrict() {
		return district;
	}
	public void setDistrict(Long district) {
		this.district = district;
	}
	public Long getWard() {
		return ward;
	}
	public void setWard(Long ward) {
		this.ward = ward;
	}
	private String name;
	private String phone;
	private String address;
	private Long province;
	private Long district;
	private Long ward;

}
