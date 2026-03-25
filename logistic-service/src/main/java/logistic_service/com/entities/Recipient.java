package logistic_service.com.entities;



import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Thông tin người nhận hàng.
 * Được snapshot tại thời điểm tạo shipment — độc lập hoàn toàn
 * với customer table của ecommerce service.
 */
@Entity
@Table(
    name = "recipient",
    indexes = @Index(name = "idx_recipient_phone", columnList = "phone")
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Recipient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "phone", nullable = false, length = 20)
    private String phone;

    @Column(name = "email")
    private String email;

    /** Địa chỉ đầy đủ (snapshot tại thời điểm tạo vận đơn). */
    @Column(name = "address", nullable = false, columnDefinition = "TEXT")
    private String address;

    @Column(name = "province", length = 100)
    private Long province;

    @Column(name = "district", length = 100)
    private Long district;

    @Column(name = "ward", length = 100)
    private Long ward;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    // ----------------------------------------------------------------
    // Relationships
    // ----------------------------------------------------------------

    @OneToMany(mappedBy = "recipient", fetch = FetchType.LAZY)
    @Builder.Default
    private List<Shipment> shipments = new ArrayList<>();
}