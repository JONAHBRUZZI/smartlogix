package com.smartlogix.orders_service.publisher;

import com.smartlogix.contracts.events.OrderEvent;
import io.awspring.cloud.sqs.operations.SqsTemplate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class OrderPublisher {

    private final SqsTemplate sqsTemplate;

    @Value("${app.sqs.orders-queue}")
    private String queueName;

    public void publishOrderCreated(OrderEvent event) {
        log.info("Publicando ORDER_CREATED para orden {}", event.getOrderId());

        sqsTemplate.send(to -> to
                .queue(queueName)
            .payload(event)
            .header("eventType", "ORDER_CREATED")
        );
    }
}