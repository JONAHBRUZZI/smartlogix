package com.smartlogix.notification_service.consumer;

import com.smartlogix.contracts.events.NotificationEvent;
import com.smartlogix.notification_service.service.NotificationService;
import io.awspring.cloud.sqs.annotation.SqsListener;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Set;

@Slf4j
@Component
@RequiredArgsConstructor
public class NotificationConsumer {

    private final NotificationService notificationService;

    @Autowired
    private Validator validator;

    @SqsListener("${app.sqs.notification-events-queue}")
    public void consumeNotifications(NotificationEvent event) {
        Set<ConstraintViolation<NotificationEvent>> violations = validator.validate(event);
        if (!violations.isEmpty()) {
            log.error("Invalid NotificationEvent received:");
            violations.forEach(v -> log.error(" - {}", v.getMessage()));
            throw new IllegalArgumentException("NotificationEvent invalido");
        }

        String targetAudience = event.getAudience() == null || event.getAudience().isBlank()
                ? "BOTH"
                : event.getAudience();

        notificationService.persistNotification(event, targetAudience);
        log.info("Notification stored: order={}, stage={}, audience={}",
                event.getOrderId(), event.getStage(), targetAudience);
    }
}
