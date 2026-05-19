package com.smartlogix.orders_service.config;

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
     * Registra el tiempo de procesamiento de una orden
     */
    public void recordOrderProcessingTime(long millis, String status) {
        Timer.builder("order.processing.time")
                .description("Tiempo de procesamiento de órdenes")
                .tag("status", status)
                .publishPercentiles(0.5, 0.95, 0.99)
                .register(meterRegistry)
                .record(millis, TimeUnit.MILLISECONDS);

        logger.debug("Recorded order processing time: {} ms with status: {}", millis, status);
    }

    /**
     * Incrementa contador de órdenes creadas
     */
    public void incrementOrdersCreated() {
        Counter.builder("orders.created.total")
                .description("Total de órdenes creadas")
                .register(meterRegistry)
                .increment();
    }

    /**
     * Incrementa contador de órdenes confirmadas
     */
    public void incrementOrdersConfirmed() {
        Counter.builder("orders.confirmed.total")
                .description("Total de órdenes confirmadas")
                .register(meterRegistry)
                .increment();
    }

    /**
     * Incrementa contador de órdenes rechazadas
     */
    public void incrementOrdersRejected() {
        Counter.builder("orders.rejected.total")
                .description("Total de órdenes rechazadas")
                .register(meterRegistry)
                .increment();
    }

    /**
     * Registra errores en procesamiento de órdenes
     */
    public void recordOrderProcessingError(String errorType) {
        Counter.builder("order.processing.errors")
                .description("Errores en procesamiento de órdenes")
                .tag("error_type", errorType)
                .register(meterRegistry)
                .increment();

        logger.warn("Recorded order processing error: {}", errorType);
    }
}
