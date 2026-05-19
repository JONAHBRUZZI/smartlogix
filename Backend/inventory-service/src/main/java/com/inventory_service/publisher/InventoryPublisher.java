package com.inventory_service.publisher;

import com.smartlogix.contracts.events.ShippingEvent;
import io.awspring.cloud.sqs.operations.SqsTemplate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class InventoryPublisher {

    private final SqsTemplate sqsTemplate;

    @Value("${app.sqs.shipping-queue:shipping-queue}")
    private String shippingQueue;

    public void publishShippingEvent(ShippingEvent shippingEvent) {
        sqsTemplate.send(to -> to
                .queue(shippingQueue)
                .payload(shippingEvent));
        log.info("Shipping event published for order {}", shippingEvent.getOrderId());
    }
}
