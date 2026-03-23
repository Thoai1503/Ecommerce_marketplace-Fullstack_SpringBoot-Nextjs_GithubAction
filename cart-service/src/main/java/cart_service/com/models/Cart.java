package cart_service.com.models;

import jakarta.persistence.*;
<<<<<<< HEAD
=======
import jakarta.persistence.criteria.CriteriaBuilder;
>>>>>>> a1ca836ab366b9e638f7e8f5f45978e34bac9691
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "cart")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
<<<<<<< HEAD
=======
@ToString
>>>>>>> a1ca836ab366b9e638f7e8f5f45978e34bac9691
public class Cart {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

<<<<<<< HEAD
    @Column(name = "product_id", nullable = false)
    private Long productId;

    @Column(name = "variant_id")
    private Long variantId;
=======
    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name="product_id")
    private Product product;

//    @Column(name = "variant_id")
//    private Long variantId;
>>>>>>> a1ca836ab366b9e638f7e8f5f45978e34bac9691

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "added_at", updatable = false)
    private LocalDateTime addedAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
<<<<<<< HEAD
=======
//
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="variant_id")
    private ProductVariant productVariant;
>>>>>>> a1ca836ab366b9e638f7e8f5f45978e34bac9691

    @PrePersist
    protected void onCreate() {
        this.addedAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
<<<<<<< HEAD
=======
    
    
>>>>>>> a1ca836ab366b9e638f7e8f5f45978e34bac9691
}