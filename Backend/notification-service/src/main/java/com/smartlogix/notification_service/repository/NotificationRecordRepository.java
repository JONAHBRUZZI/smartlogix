package com.smartlogix.notification_service.repository;

import com.smartlogix.notification_service.model.NotificationRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRecordRepository extends JpaRepository<NotificationRecord, Long> {

    boolean existsByEventIdAndTargetAudience(String eventId, String targetAudience);

    List<NotificationRecord> findByOrderIdOrderByOccurredAtAsc(Long orderId);

    List<NotificationRecord> findByTargetAudienceOrderByOccurredAtDesc(String targetAudience);
}
