package com.smartlogix.notification_service.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "notification_records", indexes = {
        @Index(name = "idx_notification_order_id", columnList = "orderId"),
        @Index(name = "idx_notification_customer_id", columnList = "customerId"),
        @Index(name = "idx_notification_audience", columnList = "targetAudience")
}, uniqueConstraints = {
    @UniqueConstraint(name = "uk_notification_event_audience", columnNames = {"eventId", "targetAudience"})
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 64)
    private String eventId;

    @Column(nullable = false)
    private Long orderId;

    @Column(nullable = false)
    private Long customerId;

    @Column(nullable = false, length = 40)
    private String stage;

    @Column(nullable = false, length = 30)
    private String status;

    @Column(nullable = false, length = 500)
    private String message;

    @Column(nullable = false, length = 20)
    private String targetAudience;

    @Column(nullable = false, length = 50)
    private String sourceService;

    @Column(nullable = false)
    private LocalDateTime occurredAt;

    @Column(nullable = false)
    private LocalDateTime receivedAt;
}
