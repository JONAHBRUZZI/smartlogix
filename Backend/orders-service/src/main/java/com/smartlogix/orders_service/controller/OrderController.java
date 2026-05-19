package com.smartlogix.orders_service.controller;

import com.smartlogix.orders_service.dto.OrderRequest;
import com.smartlogix.orders_service.dto.OrderResponse;
import com.smartlogix.orders_service.model.Order;
import com.smartlogix.orders_service.model.OrderStatus;
import com.smartlogix.orders_service.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public OrderResponse createOrder(@Valid @RequestBody OrderRequest request) {
        log.info("REST Request para crear una orden para el cliente: {}", request.getCustomerId());

        Order order = Order.builder()
                .customerId(request.getCustomerId())
                .sku(request.getSku())
                .quantity(request.getQuantity())
                .build();

        return orderService.createOrder(order);
    }

    @GetMapping("/test")
    public String test() {
        return "El controlador de Ordenes de SmartLogix esta activo!";
    }

    @GetMapping
    public List<Order> getAllOrders() {
        return orderService.getAllOrders();
    }
}
