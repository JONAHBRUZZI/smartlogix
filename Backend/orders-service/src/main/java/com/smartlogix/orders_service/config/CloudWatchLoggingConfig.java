package com.smartlogix.orders_service.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Configuración para integración con CloudWatch Logs
 * Habilita el logging centralizado en CloudWatch (local via LocalStack)
 */
@Configuration
@Profile("local-cloudwatch")
public class CloudWatchLoggingConfig {

    private static final Logger logger = LoggerFactory.getLogger(CloudWatchLoggingConfig.class);

    public CloudWatchLoggingConfig() {
        logger.info("CloudWatch Logging Configuration initialized for local environment");
        logger.info("Logs will be sent to CloudWatch via LocalStack endpoint");
    }
}
