package com.smartlogix.orders_service.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartlogix.orders_service.dto.OrderRequest;
import com.smartlogix.orders_service.dto.OrderResponse;
import com.smartlogix.orders_service.model.Order;
import com.smartlogix.orders_service.model.OrderStatus;
import com.smartlogix.orders_service.service.OrderService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(OrderController.class)
class OrderControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private OrderService orderService;

    @Test
    void testEndpoint_shouldReturnActiveMessage() throws Exception {
        mockMvc.perform(get("/api/orders/test"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").value("El controlador de Ordenes de SmartLogix esta activo!"));
    }

    @Test
    void createOrder_shouldReturnCreatedResponse() throws Exception {
        OrderRequest request = new OrderRequest();
        request.setCustomerId(10L);
        request.setSku("COCA-2L");
        request.setQuantity(5);

        OrderResponse response = OrderResponse.builder()
                .orderId(1L)
                .status("CREATED")
                .message("Orden creada correctamente")
                .createdAt(LocalDateTime.now())
                .build();

        when(orderService.createOrder(any(Order.class))).thenReturn(response);

        mockMvc.perform(post("/api/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.orderId").value(1))
                .andExpect(jsonPath("$.status").value("CREATED"))
                .andExpect(jsonPath("$.message").value("Orden creada correctamente"));
    }

    @Test
    void createOrder_shouldReturn400WhenInvalid() throws Exception {
        OrderRequest request = new OrderRequest();
        request.setCustomerId(null);
        request.setSku("COCA-2L");
        request.setQuantity(-1);

        mockMvc.perform(post("/api/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void getAllOrders_shouldReturnList() throws Exception {
        Order order1 = Order.builder()
                .id(1L)
                .customerId(10L)
                .sku("COCA-2L")
                .quantity(5)
                .status(OrderStatus.EN_PREPARACION)
                .createdAt(LocalDateTime.now())
                .build();

        when(orderService.getAllOrders()).thenReturn(List.of(order1));

        mockMvc.perform(get("/api/orders"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].sku").value("COCA-2L"));
    }

    @Test
    void confirmOrder_shouldReturnOk() throws Exception {
        Order order = Order.builder()
                .id(1L)
                .customerId(10L)
                .sku("COCA-2L")
                .quantity(5)
                .status(OrderStatus.EN_PREPARACION)
                .createdAt(LocalDateTime.now())
                .build();

        doNothing().when(orderService).confirmOrder(1L);
        when(orderService.getOrderById(1L)).thenReturn(Optional.of(order));

        mockMvc.perform(put("/api/orders/1/confirm"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("EN_PREPARACION"));
    }

    @Test
    void confirmOrder_shouldReturn400WhenNotFound() throws Exception {
        doNothing().when(orderService).confirmOrder(99L);
        when(orderService.getOrderById(99L)).thenReturn(Optional.empty());

        mockMvc.perform(put("/api/orders/99/confirm"))
                .andExpect(status().isNotFound());
    }

    @Test
    void cancelOrder_shouldReturnOk() throws Exception {
        Order order = Order.builder()
                .id(1L)
                .customerId(10L)
                .sku("COCA-2L")
                .quantity(5)
                .status(OrderStatus.CANCELADO)
                .createdAt(LocalDateTime.now())
                .cancelReason("Sin stock")
                .build();

        doNothing().when(orderService).cancelOrder(eq(1L), any());
        when(orderService.getOrderById(1L)).thenReturn(Optional.of(order));

        mockMvc.perform(put("/api/orders/1/cancel")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"reason\":\"Sin stock\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CANCELADO"))
                .andExpect(jsonPath("$.cancelReason").value("Sin stock"));
    }

    @Test
    void assignOrder_shouldSetTransporter() throws Exception {
        Order order = Order.builder()
                .id(1L)
                .customerId(10L)
                .sku("COCA-2L")
                .quantity(5)
                .status(OrderStatus.EN_PREPARACION)
                .assignedTo("Luis Castro")
                .createdAt(LocalDateTime.now())
                .build();

        doNothing().when(orderService).assignOrder(1L, "Luis Castro");
        when(orderService.getOrderById(1L)).thenReturn(Optional.of(order));

        mockMvc.perform(put("/api/orders/1/assign")
                        .param("transporter", "Luis Castro"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.assignedTo").value("Luis Castro"));
    }

    @Test
    void updateStatus_shouldReturnOk() throws Exception {
        Order order = Order.builder()
                .id(1L)
                .customerId(10L)
                .sku("COCA-2L")
                .quantity(5)
                .status(OrderStatus.EN_REPARTO)
                .createdAt(LocalDateTime.now())
                .build();

        doNothing().when(orderService).updateOrderStatus(1L, "EN_REPARTO");
        when(orderService.getOrderById(1L)).thenReturn(Optional.of(order));

        mockMvc.perform(put("/api/orders/1/status")
                        .param("status", "EN_REPARTO"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("EN_REPARTO"));
    }
}
