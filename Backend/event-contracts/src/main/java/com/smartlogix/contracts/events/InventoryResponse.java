package com.smartlogix.contracts.events;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryResponse {

    @NotNull(message = "orderId es requerido")
    private Long orderId;

    @NotNull(message = "success es requerido")
    private boolean success;

    @NotNull(message = "message es requerido")
    @NotBlank(message = "message no puede estar vacio")
    @Size(max = 500, message = "message no debe exceder 500 caracteres")
    private String message;

    @Builder.Default
    private String version = "1";
}
