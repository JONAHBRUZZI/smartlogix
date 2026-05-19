package com.smartlogix.notification_service.controller;

import com.smartlogix.notification_service.model.NotificationRecord;
import com.smartlogix.notification_service.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping("/order/{orderId}")
    public List<NotificationRecord> getByOrder(@PathVariable Long orderId) {
        return notificationService.findByOrder(orderId);
    }

    @GetMapping("/audience/{audience}")
    public List<NotificationRecord> getByAudience(@PathVariable String audience) {
        return notificationService.findByAudience(audience.toUpperCase());
    }
}
