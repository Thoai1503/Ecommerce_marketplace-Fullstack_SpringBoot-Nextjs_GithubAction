package cart_service.com.models;

import jakarta.persistence.*;
<<<<<<< HEAD
<<<<<<< HEAD
=======
import jakarta.persistence.criteria.CriteriaBuilder;
>>>>>>> a1ca836ab366b9e638f7e8f5f45978e34bac9691
=======
import jakarta.persistence.criteria.CriteriaBuilder;
>>>>>>> e4dd6569ac30ad63e61404155328fc3d319dbff5
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "cart")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
<<<<<<< HEAD
@Builder
<<<<<<< HEAD
=======
@ToString
>>>>>>> a1ca836ab366b9e638f7e8f5f45978e34bac9691
=======

@Builder
@ToString
>>>>>>> e4dd6569ac30ad63e61404155328fc3d319dbff5
public class Cart {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

<<<<<<< HEAD
<<<<<<< HEAD
    @Column(name = "product_id", nullable = false)
    private Long productId;

    @Column(name = "variant_id")
    private Long variantId;
=======
=======
>>>>>>> e4dd6569ac30ad63e61404155328fc3d319dbff5
    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name="product_id")
    private Product product;

//    @Column(name = "variant_id")
//    private Long variantId;
<<<<<<< HEAD
>>>>>>> a1ca836ab366b9e638f7e8f5f45978e34bac9691
=======
>>>>>>> e4dd6569ac30ad63e61404155328fc3d319dbff5

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "added_at", updatable = false)
    private LocalDateTime addedAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
<<<<<<< HEAD
<<<<<<< HEAD
=======
=======
>>>>>>> e4dd6569ac30ad63e61404155328fc3d319dbff5
//
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="variant_id")
    private ProductVariant productVariant;
<<<<<<< HEAD
>>>>>>> a1ca836ab366b9e638f7e8f5f45978e34bac9691
=======
>>>>>>> e4dd6569ac30ad63e61404155328fc3d319dbff5

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
<<<<<<< HEAD
=======
    
    
>>>>>>> a1ca836ab366b9e638f7e8f5f45978e34bac9691
=======
    
    
>>>>>>> e4dd6569ac30ad63e61404155328fc3d319dbff5
}