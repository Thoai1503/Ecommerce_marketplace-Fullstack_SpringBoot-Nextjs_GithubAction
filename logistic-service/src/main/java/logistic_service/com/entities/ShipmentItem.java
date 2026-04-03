package logistic_service.com.entities;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

/**
 * ShipmentItem - Danh sách sản phẩm trong một vận đơn.
 * 
 * Dữ liệu được copy (snapshot) từ ecommerce khi tạo shipment,
 * KHÔNG join ngược về ecommerce DB.
 */
@Entity
@Table(
    name = "shipment_item",
    indexes = {
        @Index(name = "idx_shipment_item_shipment", columnList = "shipment_id")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShipmentItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * FK nội bộ sang shipment.
     * Khi shipment bị xoá, tất cả items sẽ bị xoá (CASCADE).
     */
//    @ManyToOne(fetch = FetchType.LAZY, optional = false)
//    @JoinColumn(
//        name = "shipment_id",
//        nullable = false,
//        foreignKey = @ForeignKey(name = "fk_item_shipment")
//    )
//    private Shipment shipment;
	@Column(name = "shipment_id", nullable = false)
	private Long shipmentId;

    /** Tên sản phẩm tại thời điểm tạo vận đơn. */
    @Column(name = "product_name", nullable = false, length = 500)
    private String productName;

    /** SKU để đối chiếu (tuỳ chọn). */
    @Column(name = "sku", length = 100)
    private String sku;

    /** Số lượng sản phẩm. */
    @Column(name = "quantity", nullable = false)
    @Builder.Default
    private Integer quantity = 1;

    /** Giá tại thời điểm tạo vận đơn (VNĐ). */
    @Column(name = "price")
  
    private Double price ;
}
