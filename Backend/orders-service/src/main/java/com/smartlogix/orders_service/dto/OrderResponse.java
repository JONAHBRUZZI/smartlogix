package com.smartlogix.orders_service.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class OrderResponse {
    private Long orderId;
    private String status;
    private String message;
    private LocalDateTime createdAt;
}