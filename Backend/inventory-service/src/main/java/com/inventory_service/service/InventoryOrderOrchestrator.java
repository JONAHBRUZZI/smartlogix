package com.inventory_service.service;

import com.inventory_service.publisher.InventoryPublisher;
import com.smartlogix.contracts.events.OrderEvent;
import com.smartlogix.contracts.events.ShippingEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class InventoryOrderOrchestrator {

    private final InventoryService inventoryService;
    private final InventoryPublisher inventoryPublisher;

    public void processOrder(OrderEvent event) {
        var response = inventoryService.deductStock(event.getOrderId(), event.getSku(), event.getQuantity());

        if (!response.isSuccess()) {
            log.warn("Inventory processing failed for order {}: {}", event.getOrderId(), response.getMessage());
            return;
        }

        ShippingEvent shippingEvent = ShippingEvent.builder()
                .orderId(event.getOrderId())
                .customerId(event.getCustomerId())
                .sku(event.getSku())
                .quantity(event.getQuantity())
                .build();

        inventoryPublisher.publishShippingEvent(shippingEvent);
    }
}
