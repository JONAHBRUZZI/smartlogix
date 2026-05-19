package com.inventory_service.consumer;

import com.inventory_service.service.ConsumerIdempotencyService;
import com.inventory_service.service.InventoryOrderOrchestrator;
import com.smartlogix.contracts.events.OrderEvent;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validator;
import io.awspring.cloud.sqs.annotation.SqsListener;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Set;

@Slf4j
@RequiredArgsConstructor
@Component
public class OrderConsumer {

    private static final String EVENT_TYPE = "ORDER_CREATED";

    private final InventoryOrderOrchestrator inventoryOrderOrchestrator;
    private final ConsumerIdempotencyService idempotencyService;

    @Autowired
    private Validator validator;

    @SqsListener("orders-queue")
    public void consumeOrderEvent(OrderEvent event) {
        log.info("Evento recibido en Inventory. Order ID: {}, SKU: {}, Cantidad: {}",
                event.getOrderId(), event.getSku(), event.getQuantity());

        String eventKey = event.getOrderId().toString();
        if (!idempotencyService.beginProcessing(EVENT_TYPE, eventKey)) {
            log.warn("Duplicate ORDER_CREATED skipped for order {}", event.getOrderId());
            return;
        }

        Set<ConstraintViolation<OrderEvent>> violations = validator.validate(event);
        if (!violations.isEmpty()) {
            log.error("OrderEvent invalido:");
            violations.forEach(v -> log.error("  - {}", v.getMessage()));
            String errorMsg = violations.stream()
                    .map(ConstraintViolation::getMessage)
                    .reduce((a, b) -> a + "; " + b)
                    .orElse("Validacion fallida");
            idempotencyService.releaseOnFailure(EVENT_TYPE, eventKey);
            throw new IllegalArgumentException("OrderEvent invalido: " + errorMsg);
        }

        try {
            inventoryOrderOrchestrator.processOrder(event);
            idempotencyService.markProcessed(EVENT_TYPE, eventKey);
        } catch (Exception ex) {
            log.error("Error procesando orden {}: {}", event.getOrderId(), ex.getMessage(), ex);
            idempotencyService.releaseOnFailure(EVENT_TYPE, eventKey);
            throw ex;
        }
    }
}
