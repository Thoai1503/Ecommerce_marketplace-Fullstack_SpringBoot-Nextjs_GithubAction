package logistic_service.com.entities;

//package com.logistics.domain.entity;
//
//import com.logistics.domain.base.BaseEntity;
import logistic_service.com.enums.ShipmentStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Vận đơn — đơn vị trung tâm của logistics service.
 *
 * Lưu ý quan trọng về loose coupling với ecommerce:
 *   - orderRefId  : ID đơn hàng bên ecommerce, lưu String, KHÔNG là FK.
 *   - shopRefId   : ID shop bên ecommerce, lưu String, KHÔNG là FK.
 *   - partner     : FK nội bộ -> LogisticsPartner (trong cùng logistics DB).
 *   - recipient   : FK nội bộ -> Recipient (snapshot thông tin người nhận).
 */
@Entity
@Table(
    name = "shipment",
    uniqueConstraints = @UniqueConstraint(
        name = "uq_tracking_code", columnNames = "tracking_code"
    ),
    indexes = {
        @Index(name = "idx_shipment_order_ref",  columnList = "order_ref_id"),
        @Index(name = "idx_shipment_shop_ref",   columnList = "shop_ref_id"),
        @Index(name = "idx_shipment_partner",    columnList = "partner_id"),
        @Index(name = "idx_shipment_recipient",  columnList = "recipient_id"),
        @Index(name = "idx_shipment_status",     columnList = "status")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Shipment  {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Mã tracking hiển thị cho khách hàng (VD: LOG20240001). */
    @Column(name = "tracking_code", nullable = false, length = 100)
    private String trackingCode;

    /**
     * order_id bên ecommerce service.
     * Chỉ lưu để đối chiếu / callback — KHÔNG phải FK, không join ecommerce DB.
     */
    @Column(name = "order_shipment_ref_id", nullable = false, length = 100)
    private Long orderShipmentRefId;

    /**
     * shop_id bên ecommerce service.
     * KHÔNG phải FK — giao tiếp qua REST API hoặc Kafka.
     */
    @Column(name = "shop_ref_id", nullable = false, length = 100)
    private Long shopRefId;

    /** FK nội bộ sang logistics_partner. */

//    @ManyToOne(fetch = FetchType.LAZY, optional = false)
//    @JoinColumn(name = "partner_id", nullable = false,
//                foreignKey = @ForeignKey(name = "fk_shipment_partner"))
//    private LogisticsPartner partner;
    
    @Column(name = "partner_id", nullable = false)
    private Long partnerId;

//    @ManyToOne(fetch = FetchType.LAZY, optional = false)
//    @JoinColumn(name = "partner_id", nullable = false,
//                foreignKey = @ForeignKey(name = "fk_shipment_partner"))
//    private LogisticsPartner partner;

    /** FK nội bộ sang recipient (snapshot người nhận). */
//    @ManyToOne(fetch = FetchType.LAZY, optional = false)
//    @JoinColumn(name = "recipient_id", nullable = false,
//                foreignKey = @ForeignKey(name = "fk_shipment_recipient"))
//    private Recipient recipient;
    
    @Column(name = "recipient_id", nullable = false)
    private Long recipientId;

    

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    @Builder.Default
    private ShipmentStatus status = ShipmentStatus.PENDING;


    @Column(name = "shipping_fee")
    @Builder.Default
    private Double shippingFee =  Double.valueOf(0);

    @Column(name = "cod_amount")
    @Builder.Default
    private Double codAmount = Double.valueOf(0);

 

    /** Khối lượng gói hàng tính bằng gram. */
    @Column(name = "weight_gram")
    private Integer weightGram;

    @Column(name = "note", columnDefinition = "TEXT")
    private String note;

    @Column(name = "estimated_delivery_at")
    private LocalDateTime estimatedDeliveryAt;

    @Column(name = "delivered_at")
    private LocalDateTime deliveredAt;

    @Column(name = "created_at", updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    // ----------------------------------------------------------------
    // Relationships (nội bộ logistics service)
    // ----------------------------------------------------------------

//    @OneToMany(mappedBy = "shipment", fetch = FetchType.LAZY,
//               cascade = CascadeType.ALL, orphanRemoval = true)
//    @Builder.Default
//    private List<ShipmentItem> items = new ArrayList<>();

    @OneToMany(mappedBy = "shipment", fetch = FetchType.LAZY,
               cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("updatedAt ASC")
    @Builder.Default
    private List<ShipmentStatusHistory> statusHistories = new ArrayList<>();

    @OneToMany(mappedBy = "shipment", fetch = FetchType.LAZY,
               cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<OrderShipmentMapping> orderMappings = new ArrayList<>();

    // ----------------------------------------------------------------
    // Helper methods
    // ----------------------------------------------------------------

//    public void addItem(ShipmentItem item) {
//        items.add(item);
//        item.setShipment(this);
//    }

    public void addStatusHistory(ShipmentStatusHistory history) {
        statusHistories.add(history);
        history.setShipment(this);
    }
}