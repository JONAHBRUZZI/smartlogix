package com.smartlogix.shipping_service.publisher;

import com.smartlogix.contracts.events.NotificationEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Slf4j
@Component
@RequiredArgsConstructor
public class NotificationPublisher {

    private final RestTemplate restTemplate;

    @Value("${app.notification-service.url}")
    private String notificationServiceUrl;

    public void publish(NotificationEvent event) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<NotificationEvent> request = new HttpEntity<>(event, headers);

            restTemplate.postForEntity(
                    notificationServiceUrl + "/api/notifications",
                    request,
                    Void.class
            );

            log.info("Notification event {} published for order {} audience {}",
                    event.getStage(), event.getOrderId(), event.getAudience());
        } catch (Exception ex) {
            log.error("Error publishing notification for order {}: {}", event.getOrderId(), ex.getMessage());
        }
    }
}
