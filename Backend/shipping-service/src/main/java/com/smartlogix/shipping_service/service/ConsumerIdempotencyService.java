package com.smartlogix.shipping_service.service;

import com.smartlogix.shipping_service.model.ProcessedEvent;
import com.smartlogix.shipping_service.repository.ProcessedEventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class ConsumerIdempotencyService {

    private static final String STATUS_PROCESSING = "PROCESSING";
    private static final String STATUS_PROCESSED = "PROCESSED";

    private final ProcessedEventRepository processedEventRepository;

    @Transactional
    public boolean beginProcessing(String eventType, String eventKey) {
        var existing = processedEventRepository.findByEventTypeAndEventKey(eventType, eventKey);
        if (existing.isPresent()) {
            return false;
        }

        try {
            processedEventRepository.save(ProcessedEvent.builder()
                    .eventType(eventType)
                    .eventKey(eventKey)
                    .status(STATUS_PROCESSING)
                    .createdAt(LocalDateTime.now())
                    .build());
            return true;
        } catch (DataIntegrityViolationException ex) {
            return false;
        }
    }

    @Transactional
    public void markProcessed(String eventType, String eventKey) {
        processedEventRepository.findByEventTypeAndEventKey(eventType, eventKey)
                .ifPresent(event -> {
                    event.setStatus(STATUS_PROCESSED);
                    event.setProcessedAt(LocalDateTime.now());
                    processedEventRepository.save(event);
                });
    }

    @Transactional
    public void releaseOnFailure(String eventType, String eventKey) {
        processedEventRepository.findByEventTypeAndEventKey(eventType, eventKey)
                .ifPresent(event -> {
                    if (STATUS_PROCESSING.equals(event.getStatus())) {
                        processedEventRepository.delete(event);
                    }
                });
    }
}
