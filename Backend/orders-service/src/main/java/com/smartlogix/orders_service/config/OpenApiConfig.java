package com.smartlogix.orders_service.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI ordersOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Orders Service API")
                        .version("1.0")
                        .description("Gestion de pedidos: creacion, confirmacion, cancelacion y asignacion de transportista")
                        .contact(new Contact()
                                .name("SmartLogix")
                                .email("soporte@smartlogix.cl")));
    }
}
