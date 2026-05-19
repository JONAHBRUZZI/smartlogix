package com.smartlogix.shipping_service.consumer;

import com.smartlogix.contracts.events.ShippingEvent;
import com.smartlogix.shipping_service.service.ConsumerIdempotencyService;
import com.smartlogix.shipping_service.service.ShippingService;
import io.awspring.cloud.sqs.annotation.SqsListener;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import java.util.Set;

@Slf4j
@RequiredArgsConstructor
@Component
public class ShippingConsumer {

    private static final String EVENT_TYPE = "SHIPPING_CREATED";

    private final ShippingService shippingService;
    private final ConsumerIdempotencyService idempotencyService;

    @Autowired
    private Validator validator;

    @SqsListener("shipping-queue")
    public void consumeShippingEvent(ShippingEvent event) {
        log.info("[SHIPPING] Evento recibido. Orden ID: {}, Cliente: {}, SKU: {}, Cantidad: {}",
                event.getOrderId(), event.getCustomerId(), event.getSku(), event.getQuantity());

        String eventKey = event.getOrderId().toString();
        if (!idempotencyService.beginProcessing(EVENT_TYPE, eventKey)) {
            log.warn("Duplicate SHIPPING_CREATED skipped for order {}", event.getOrderId());
            return;
        }

        Set<ConstraintViolation<ShippingEvent>> violations = validator.validate(event);
        if (!violations.isEmpty()) {
            log.error("[SHIPPING] ShippingEvent invalido:");
            violations.forEach(v -> log.error("  - {}", v.getMessage()));
            String errorMsg = violations.stream()
                    .map(ConstraintViolation::getMessage)
                    .reduce((a, b) -> a + "; " + b)
                    .orElse("Validacion fallida");
            idempotencyService.releaseOnFailure(EVENT_TYPE, eventKey);
            throw new IllegalArgumentException("ShippingEvent invalido: " + errorMsg);
        }

        try {
            shippingService.createShipment(
                    event.getOrderId(),
                    event.getCustomerId(),
                    event.getSku(),
                    event.getQuantity()
            );

            idempotencyService.markProcessed(EVENT_TYPE, eventKey);

            log.info("[SHIPPING] Envio creado exitosamente para orden {}", event.getOrderId());
        } catch (Exception ex) {
            log.error("[SHIPPING] Error al procesar envio para orden {}: {}", event.getOrderId(), ex.getMessage(), ex);
            idempotencyService.releaseOnFailure(EVENT_TYPE, eventKey);
            throw ex;
        }
    }
}
