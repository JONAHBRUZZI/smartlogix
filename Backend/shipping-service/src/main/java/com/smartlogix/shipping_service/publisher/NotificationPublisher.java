package com.smartlogix.shipping_service.publisher;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartlogix.contracts.events.NotificationEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import software.amazon.awssdk.services.sns.SnsClient;
import software.amazon.awssdk.services.sns.model.MessageAttributeValue;
import software.amazon.awssdk.services.sns.model.PublishRequest;

import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class NotificationPublisher {

    private final SnsClient snsClient;
    private final ObjectMapper objectMapper;

    @Value("${app.sns.notification-topic-arn}")
    private String notificationTopicArn;

    public void publish(NotificationEvent event) {
        publish(event, event.getAudience());
    }

    public void publish(NotificationEvent event, String audience) {
        try {
            String payload = objectMapper.writeValueAsString(event);
            PublishRequest request = PublishRequest.builder()
                    .topicArn(notificationTopicArn)
                    .message(payload)
                    .messageAttributes(Map.of(
                            "audience", MessageAttributeValue.builder()
                                    .dataType("String")
                                    .stringValue(audience)
                                    .build()
                    ))
                    .build();

            snsClient.publish(request);
            log.info("Notification event {} published for order {} audience {}",
                    event.getStage(), event.getOrderId(), audience);
        } catch (JsonProcessingException ex) {
            log.error("Cannot serialize notification event for order {}", event.getOrderId(), ex);
        } catch (Exception ex) {
            // Notification fan-out is best effort to avoid blocking shipping processing.
            log.error("Error publishing notification for order {}", event.getOrderId(), ex);
        }
    }
}
