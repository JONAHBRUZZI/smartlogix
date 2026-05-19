package com.smartlogix.orders_service.repository;

import com.smartlogix.orders_service.model.ProcessedEvent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ProcessedEventRepository extends JpaRepository<ProcessedEvent, Long> {
    Optional<ProcessedEvent> findByEventTypeAndEventKey(String eventType, String eventKey);
}
