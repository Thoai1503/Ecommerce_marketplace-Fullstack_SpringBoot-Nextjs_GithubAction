package docker_test.com.model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name = "order_item")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class OrderItem {
	
	

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	@Column(name = "order_id", nullable = false)
	private Long orderId;
	
	@Column(name = "product_id", nullable = false)
	private Long productId;
	
	@Column(name = "shop_id", nullable = false)
	private Long shopId;
	
	@Column(name = "shipment_id", nullable = false)
	private Long shipmentId;
	
	@Column(name = "variant_id", nullable = false)
	private Long variantId;
	
	@Column(name = "product_name", nullable = false)
	private String productName;
	
	@Column(name = "variant_name", nullable = false)
	private String variantName;
	
	@Column(name ="image")
	private String image;
	
	@Column(name = "quantity", nullable = false)
	private Integer quantity;
	
	@Column(name = "price", nullable = false)
	private Double price;
	
	@Column(name = "total_price", nullable = false)
	private Double totalPrice;
    
	@Column(name = "return_request_quantity", nullable = false)
	private Integer returnRequestQuantity;
	
	
	
	@Column(name = "shop_voucher_discount_amount", nullable = false)
	private Double shopVoucherDiscountAmount;

	@Column(name = "platform_voucher_discount_amount", nullable = false)
	private Double platformVoucherDiscountAmount;

	@Column(name = "total_voucher_discount_amount", nullable = false)
	private Double totalVoucherDiscountAmount;

	@Column(name = "total_after_shop_voucher", nullable = false)
	private Double totalAfterShopVoucher;

	@Column(name = "total_after_all_vouchers", nullable = false)
	private Double totalAfterAllVouchers;

	@Column(name = "platform_commission_rate", nullable = false)
	private Double platformCommissionRate;

	@Column(name = "platform_commission_amount", nullable = false)
	private Double platformCommissionAmount;

	@Column(name = "seller_receivable_amount", nullable = false)
	private Double sellerReceivableAmount;

	@Column(name = "commission_calculated_at")
	private LocalDateTime commissionCalculatedAt;
	
	
	@Column(name = "unit_platform_voucher_discount", nullable = false)
    private double unitPlatformVoucherDiscount;

	@Column(name = "final_quantity")
	private Integer finalQuantity;

	@Column(name = "is_adjusted", nullable = false)
	private Boolean isAdjusted;
	
	
	@Column(name = "last_return_request_id")
	private Long lastReturnRequestId;
	
	
	@Column(name = "unit_shop_voucher_discount", nullable = false)
    private double unitShopVoucherDiscount;
	
//	@Column(name = "created_at", nullable = false)
//	private LocalDateTime createdAt;
}
