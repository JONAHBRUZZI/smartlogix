package com.smartlogix.notification_service.config;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import org.springframework.stereotype.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.concurrent.TimeUnit;

/**
 * Recolector de métricas personalizadas para CloudWatch
 * Registra contadores y timers de operaciones clave
 */
@Component
public class MetricsCollector {

    private static final Logger logger = LoggerFactory.getLogger(MetricsCollector.class);
    private final MeterRegistry meterRegistry;

    public MetricsCollector(MeterRegistry meterRegistry) {
        this.meterRegistry = meterRegistry;
    }

    /**
     * Registra el tiempo de persistencia de notificaciones
     */
    public void recordNotificationPersistenceTime(long millis, String audience) {
        Timer.builder("notification.persistence.time")
                .description("Tiempo de persistencia de notificaciones")
                .tag("audience", audience)
                .publishPercentiles(0.5, 0.95, 0.99)
                .register(meterRegistry)
                .record(millis, TimeUnit.MILLISECONDS);

        logger.debug("Recorded notification persistence time: {} ms for audience: {}", millis, audience);
    }

    /**
     * Incrementa contador de notificaciones persistidas
     */
    public void incrementNotificationsPersisted(String audience, String status) {
        Counter.builder("notifications.persisted.total")
                .description("Total de notificaciones persistidas")
                .tag("audience", audience)
                .tag("status", status)
                .register(meterRegistry)
                .increment();
    }

    /**
     * Incrementa contador de notificaciones para cliente
     */
    public void incrementClientNotifications() {
        Counter.builder("notifications.client.total")
                .description("Total de notificaciones para cliente")
                .register(meterRegistry)
                .increment();
    }

    /**
     * Incrementa contador de notificaciones para operador
     */
    public void incrementOperatorNotifications() {
        Counter.builder("notifications.operator.total")
                .description("Total de notificaciones para operador")
                .register(meterRegistry)
                .increment();
    }

    /**
     * Registra duplicados detectados (idempotencia)
     */
    public void recordDuplicateDetected(String eventId) {
        Counter.builder("notifications.duplicates.detected")
                .description("Duplicados detectados por idempotencia")
                .tag("event_id", eventId)
                .register(meterRegistry)
                .increment();

        logger.debug("Recorded duplicate detection for event: {}", eventId);
    }

    /**
     * Registra errores en persistencia
     */
    public void recordPersistenceError(String errorType) {
        Counter.builder("notification.persistence.errors")
                .description("Errores en persistencia de notificaciones")
                .tag("error_type", errorType)
                .register(meterRegistry)
                .increment();

        logger.warn("Recorded notification persistence error: {}", errorType);
    }
}
