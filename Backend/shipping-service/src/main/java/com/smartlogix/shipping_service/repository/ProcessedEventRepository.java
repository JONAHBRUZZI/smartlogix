package com.smartlogix.shipping_service.repository;

import com.smartlogix.shipping_service.model.ProcessedEvent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ProcessedEventRepository extends JpaRepository<ProcessedEvent, Long> {
    Optional<ProcessedEvent> findByEventTypeAndEventKey(String eventType, String eventKey);
}
