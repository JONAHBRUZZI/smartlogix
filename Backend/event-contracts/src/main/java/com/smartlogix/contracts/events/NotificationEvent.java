package com.smartlogix.contracts.events;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationEvent {

    @NotNull(message = "eventId es requerido")
    @NotBlank(message = "eventId no puede estar vacio")
    private String eventId;

    @NotNull(message = "orderId es requerido")
    private Long orderId;

    @NotNull(message = "customerId es requerido")
    private Long customerId;

    @NotNull(message = "stage es requerido")
    @NotBlank(message = "stage no puede estar vacio")
    @Pattern(regexp = "^[A-Z_]{3,40}$", message = "stage debe estar en formato MAYUSCULAS_CON_GUION_BAJO")
    private String stage;

    @NotNull(message = "status es requerido")
    @NotBlank(message = "status no puede estar vacio")
    @Pattern(regexp = "^(CREATED|PROCESSING|SUCCESS|FAILED|CONFIRMED|REJECTED|PENDING|SHIPPED)$", message = "status contiene un valor no soportado")
    private String status;

    @NotNull(message = "message es requerido")
    @NotBlank(message = "message no puede estar vacio")
    @Size(max = 500, message = "message no debe exceder 500 caracteres")
    private String message;

    @NotNull(message = "sourceService es requerido")
    @NotBlank(message = "sourceService no puede estar vacio")
    @Pattern(regexp = "^(orders-service|inventory-service|shipping-service)$", message = "sourceService no soportado")
    private String sourceService;

    @Builder.Default
    @NotBlank(message = "audience no puede estar vacio")
    @Pattern(regexp = "^(CLIENT|OPERATOR|BOTH)$", message = "audience debe ser CLIENT, OPERATOR o BOTH")
    private String audience = "BOTH";

    @Builder.Default
    @NotNull(message = "occurredAt es requerido")
    private LocalDateTime occurredAt = LocalDateTime.now();

    @Builder.Default
    private String version = "1";
}
