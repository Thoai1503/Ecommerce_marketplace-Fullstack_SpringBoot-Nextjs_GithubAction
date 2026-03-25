package logistic_service.com.entities;



//import com.logistics.domain.base.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

/**
 * Đối tác shop đã đăng ký sử dụng logistics service.
 * shop_ref_id là ID của shop bên ecommerce service — lưu dạng
 * String (loose coupling), KHÔNG là FK sang ecommerce DB.
 */
@Entity
@Table(
    name = "logistics_partner",
    uniqueConstraints = {
        @UniqueConstraint(name = "uq_partner_api_key",  columnNames = "api_key"),
        @UniqueConstraint(name = "uq_partner_shop_ref", columnNames = "shop_ref_id")
    }
)
@Getter
@Setter

@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LogisticsPartner  {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * ID shop bên ecommerce service.
     * Lưu dạng String — KHÔNG phải FK, không join sang ecommerce DB.
     */
    @Column(name = "shop_ref_id", nullable = false, length = 100)
    private String shopRefId;

    @Column(name = "shop_name", nullable = false)
    private String shopName;

    /** API key để shop xác thực khi gọi logistics API. */
    @Column(name = "api_key", nullable = false)
    private String apiKey;

    @Column(name = "contact_email")
    private String contactEmail;

    @Column(name = "phone", length = 20)
    private String phone;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    // ----------------------------------------------------------------
    // Relationships (nội bộ logistics service)
    // ----------------------------------------------------------------

 //   @OneToMany(mappedBy = "partner", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
  //  @Builder.Default
  //  private List<Shipment> shipments = new ArrayList<>();
}