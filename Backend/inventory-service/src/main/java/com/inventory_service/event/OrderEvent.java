package com.inventory_service.event;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderEvent {

    private String orderId;
    private String userId;
    private String sku;
    private Integer quantity;

}