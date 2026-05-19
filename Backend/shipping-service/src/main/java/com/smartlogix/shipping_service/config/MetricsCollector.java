package com.smartlogix.shipping_service.config;

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
     * Registra el tiempo de creación de envío
     */
    public void recordShipmentCreationTime(long millis, String status) {
        Timer.builder("shipment.creation.time")
                .description("Tiempo de creación de envíos")
                .tag("status", status)
                .publishPercentiles(0.5, 0.95, 0.99)
                .register(meterRegistry)
                .record(millis, TimeUnit.MILLISECONDS);

        logger.debug("Recorded shipment creation time: {} ms with status: {}", millis, status);
    }

    /**
     * Incrementa contador de envíos creados
     */
    public void incrementShipmentsCreated() {
        Counter.builder("shipments.created.total")
                .description("Total de envíos creados")
                .register(meterRegistry)
                .increment();
    }

    /**
     * Incrementa contador de envíos enviados
     */
    public void incrementShipmentsShipped() {
        Counter.builder("shipments.shipped.total")
                .description("Total de envíos despachados")
                .register(meterRegistry)
                .increment();
    }

    /**
     * Incrementa contador de envíos pendientes
     */
    public void recordPendingShipments(int count) {
        io.micrometer.core.instrument.Gauge.builder("shipments.pending", () -> count)
                .description("Envíos pendientes")
                .register(meterRegistry);
    }

    /**
     * Registra errores en creación de envíos
     */
    public void recordShipmentError(String errorType) {
        Counter.builder("shipment.creation.errors")
                .description("Errores en creación de envíos")
                .tag("error_type", errorType)
                .register(meterRegistry)
                .increment();

        logger.warn("Recorded shipment creation error: {}", errorType);
    }
}
