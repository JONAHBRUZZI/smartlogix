package com.inventory_service.event;

import lombok.*;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BaseEvent {

    private String eventId;
    private String eventType;
    private String version;
    private Instant timestamp;

}