package cart_service.com.models;

import jakarta.persistence.*;
import jakarta.persistence.criteria.CriteriaBuilder;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "cart")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor

@Builder
@ToString
public class Cart {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name="product_id")
    private Product product;

//    @Column(name = "variant_id")
//    private Long variantId;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "added_at", updatable = false)
    private LocalDateTime addedAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
//
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="variant_id")
    private ProductVariant productVariant;

    @PrePersist
    protected void onCreate() {
        this.addedAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
    
    
}