package com.smartlogix.notification_service.service;

import com.smartlogix.contracts.events.NotificationEvent;
import com.smartlogix.notification_service.model.NotificationRecord;
import com.smartlogix.notification_service.repository.NotificationRecordRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRecordRepository notificationRecordRepository;

    @Transactional
    public void persistNotification(NotificationEvent event, String targetAudience) {
        if (notificationRecordRepository.existsByEventIdAndTargetAudience(event.getEventId(), targetAudience)) {
            log.warn("Duplicate notification skipped. eventId={}, audience={}", event.getEventId(), targetAudience);
            return;
        }

        NotificationRecord record = NotificationRecord.builder()
                .eventId(event.getEventId())
                .orderId(event.getOrderId())
                .customerId(event.getCustomerId())
                .stage(event.getStage())
                .status(event.getStatus())
                .message(event.getMessage())
                .targetAudience(targetAudience)
                .sourceService(event.getSourceService())
                .occurredAt(event.getOccurredAt())
                .receivedAt(LocalDateTime.now())
                .build();

        try {
            notificationRecordRepository.save(record);
        } catch (DataIntegrityViolationException ex) {
            log.warn("Duplicate notification suppressed by DB constraint. eventId={}, audience={}",
                    event.getEventId(), targetAudience);
        }
    }

    public List<NotificationRecord> findByOrder(Long orderId) {
        return notificationRecordRepository.findByOrderIdOrderByOccurredAtAsc(orderId);
    }

    public List<NotificationRecord> findByAudience(String audience) {
        return notificationRecordRepository.findByTargetAudienceOrderByOccurredAtDesc(audience);
    }
}
