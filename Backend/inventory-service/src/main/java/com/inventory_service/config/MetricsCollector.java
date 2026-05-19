package com.inventory_service.config;

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
     * Registra el tiempo de validación de inventario
     */
    public void recordInventoryValidationTime(long millis, String result) {
        Timer.builder("inventory.validation.time")
                .description("Tiempo de validación de inventario")
                .tag("result", result)
                .publishPercentiles(0.5, 0.95, 0.99)
                .register(meterRegistry)
                .record(millis, TimeUnit.MILLISECONDS);

        logger.debug("Recorded inventory validation time: {} ms with result: {}", millis, result);
    }

    /**
     * Incrementa contador de validaciones exitosas
     */
    public void incrementValidationsSuccessful() {
        Counter.builder("inventory.validations.successful")
                .description("Validaciones de inventario exitosas")
                .register(meterRegistry)
                .increment();
    }

    /**
     * Incrementa contador de validaciones fallidas (sin stock)
     */
    public void incrementValidationsFailed() {
        Counter.builder("inventory.validations.failed")
                .description("Validaciones de inventario sin stock")
                .register(meterRegistry)
                .increment();
    }

    /**
     * Registra reducción de stock
     */
    public void recordStockReduction(Long sku, int quantity) {
        Counter.builder("inventory.stock.reductions")
                .description("Reducciones de stock")
                .tag("sku", sku.toString())
                .register(meterRegistry)
                .increment(quantity);

        logger.debug("Recorded stock reduction for SKU: {}, quantity: {}", sku, quantity);
    }

    /**
     * Registra errores en validación
     */
    public void recordValidationError(String errorType) {
        Counter.builder("inventory.validation.errors")
                .description("Errores en validación de inventario")
                .tag("error_type", errorType)
                .register(meterRegistry)
                .increment();

        logger.warn("Recorded inventory validation error: {}", errorType);
    }
}
