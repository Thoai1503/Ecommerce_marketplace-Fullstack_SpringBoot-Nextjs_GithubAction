package docker_test.com.models.voucher;

public enum DiscountType {
	PERCENTAGE, FIXED;

	 public static DiscountType fromDb(String value) {
		return DiscountType.valueOf(value.toUpperCase());
	}
}
