package com.smartlogix.shipping_service.service;

import com.smartlogix.contracts.events.NotificationEvent;
import com.smartlogix.shipping_service.model.Shipment;
import com.smartlogix.shipping_service.model.ShipmentStatus;
import com.smartlogix.shipping_service.publisher.NotificationPublisher;
import com.smartlogix.shipping_service.repository.ShipmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ShippingService {

    private final ShipmentRepository shipmentRepository;
    private final NotificationPublisher notificationPublisher;

    @Transactional
    public Shipment createShipment(Long orderId, Long customerId, String sku, Integer quantity) {
        log.info("[SHIPPING] Creando envio para Orden ID: {}, Cliente: {}, SKU: {}, Cantidad: {}",
                orderId, customerId, sku, quantity);

        Shipment shipment = Shipment.builder()
                .orderId(orderId)
                .customerId(customerId)
                .sku(sku)
                .quantity(quantity)
                .status(ShipmentStatus.EN_PREPARACION)
                .trackingNumber(generateTrackingNumber())
                .createdAt(LocalDateTime.now())
                .build();

        Shipment savedShipment = shipmentRepository.save(shipment);
        log.info("[SHIPPING] Envio creado con ID: {}, Tracking: {}", savedShipment.getId(), savedShipment.getTrackingNumber());

        notificationPublisher.publish(buildNotification(savedShipment, "SHIPMENT_CREATED",
                "Envio creado con tracking " + savedShipment.getTrackingNumber()));

        return savedShipment;
    }

    @Transactional
    public void markEnReparto(Long shipmentId) {
        Shipment shipment = shipmentRepository.findById(shipmentId)
                .orElseThrow(() -> new RuntimeException("Envio no encontrado: " + shipmentId));
        shipment.setStatus(ShipmentStatus.EN_REPARTO);
        shipment.setShippedAt(LocalDateTime.now());
        shipmentRepository.save(shipment);

        notificationPublisher.publish(buildNotification(shipment, "SHIPMENT_IN_TRANSIT",
                "Envio en reparto - Tracking: " + shipment.getTrackingNumber()));
    }

    @Transactional
    public void markEntregado(Long shipmentId, String customerCode, String recipientRut, String proofImage) {
        Shipment shipment = shipmentRepository.findById(shipmentId)
                .orElseThrow(() -> new RuntimeException("Envio no encontrado: " + shipmentId));
        shipment.setStatus(ShipmentStatus.ENTREGADO);
        shipment.setCustomerCode(customerCode);
        shipment.setRecipientRut(recipientRut);
        if (proofImage != null && !proofImage.isBlank()) {
            shipment.setProofOfDeliveryImage(proofImage);
        }
        shipmentRepository.save(shipment);

        notificationPublisher.publish(buildNotification(shipment, "SHIPMENT_DELIVERED",
                "Envio entregado - Tracking: " + shipment.getTrackingNumber()));
    }

    @Transactional
    public void cancelShipment(Long shipmentId) {
        Shipment shipment = shipmentRepository.findById(shipmentId)
                .orElseThrow(() -> new RuntimeException("Envio no encontrado: " + shipmentId));
        shipment.setStatus(ShipmentStatus.CANCELADO);
        shipmentRepository.save(shipment);

        notificationPublisher.publish(buildNotification(shipment, "SHIPMENT_CANCELLED",
                "Envio cancelado - Tracking: " + shipment.getTrackingNumber()));
    }

    private String generateTrackingNumber() {
        return "TRACK-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    private NotificationEvent buildNotification(Shipment shipment, String stage, String message) {
        return NotificationEvent.builder()
                .eventId(UUID.randomUUID().toString())
                .orderId(shipment.getOrderId())
                .customerId(shipment.getCustomerId())
                .stage(stage)
                .status(shipment.getStatus().name())
                .message(message)
                .sourceService("shipping-service")
                .audience("BOTH")
                .occurredAt(LocalDateTime.now())
                .build();
    }
}
