package com.smartlogix.orders_service.service;

import com.smartlogix.orders_service.dto.OrderResponse;
import com.smartlogix.orders_service.model.Order;
import com.smartlogix.orders_service.model.OrderStatus;
import com.smartlogix.orders_service.repository.OrderRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private RestTemplate restTemplate;

    @InjectMocks
    private OrderService orderService;

    private Order sampleOrder;

    @BeforeEach
    void setUp() {
        sampleOrder = Order.builder()
                .id(1L)
                .customerId(10L)
                .sku("COCA-2L")
                .quantity(5)
                .status(OrderStatus.CREATED)
                .createdAt(LocalDateTime.now())
                .build();
    }

    @Test
    void createOrder_shouldSaveAndReturnResponse() {
        when(orderRepository.save(any(Order.class))).thenReturn(sampleOrder);

        OrderResponse response = orderService.createOrder(
                Order.builder()
                        .customerId(10L)
                        .sku("COCA-2L")
                        .quantity(5)
                        .build()
        );

        assertThat(response.getOrderId()).isEqualTo(1L);
        assertThat(response.getStatus()).isEqualTo("CREATED");
        assertThat(response.getMessage()).isEqualTo("Orden creada correctamente");

        ArgumentCaptor<Order> captor = ArgumentCaptor.forClass(Order.class);
        verify(orderRepository).save(captor.capture());
        assertThat(captor.getValue().getStatus()).isEqualTo(OrderStatus.CREATED);
        assertThat(captor.getValue().getCreatedAt()).isNotNull();
    }

    @Test
    void confirmOrder_shouldUpdateStatusAndCallServices() {
        when(orderRepository.findById(1L)).thenReturn(Optional.of(sampleOrder));
        when(orderRepository.save(any(Order.class))).thenReturn(sampleOrder);

        orderService.confirmOrder(1L);

        verify(orderRepository).save(any(Order.class));
        verify(restTemplate).put(
                eq("http://inventory-service:8082/api/inventory/COCA-2L/adjust?delta=-5"),
                eq(null)
        );
    }

    @Test
    void confirmOrder_shouldThrowWhenNotFound() {
        when(orderRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> orderService.confirmOrder(99L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("99");
    }

    @Test
    void cancelOrder_shouldUpdateStatusAndReason() {
        when(orderRepository.findById(1L)).thenReturn(Optional.of(sampleOrder));
        when(orderRepository.save(any(Order.class))).thenReturn(sampleOrder);

        orderService.cancelOrder(1L, "Producto agotado");

        ArgumentCaptor<Order> captor = ArgumentCaptor.forClass(Order.class);
        verify(orderRepository).save(captor.capture());
        assertThat(captor.getValue().getStatus()).isEqualTo(OrderStatus.CANCELADO);
        assertThat(captor.getValue().getCancelReason()).isEqualTo("Producto agotado");
    }

    @Test
    void cancelOrder_whenEnPreparacion_shouldRestoreStock() {
        sampleOrder.setStatus(OrderStatus.EN_PREPARACION);
        when(orderRepository.findById(1L)).thenReturn(Optional.of(sampleOrder));
        when(orderRepository.save(any(Order.class))).thenReturn(sampleOrder);

        orderService.cancelOrder(1L, "Cancelado por cliente");

        verify(restTemplate).put(
                eq("http://inventory-service:8082/api/inventory/COCA-2L/adjust?delta=+5"),
                eq(null)
        );
    }

    @Test
    void cancelOrder_whenCreated_shouldNotRestoreStock() {
        sampleOrder.setStatus(OrderStatus.CREATED);
        when(orderRepository.findById(1L)).thenReturn(Optional.of(sampleOrder));
        when(orderRepository.save(any(Order.class))).thenReturn(sampleOrder);

        orderService.cancelOrder(1L, "Cancelado");

        verify(restTemplate, never()).put(anyString(), any());
    }

    @Test
    void updateOrderStatus_shouldChangeStatus() {
        when(orderRepository.findById(1L)).thenReturn(Optional.of(sampleOrder));
        when(orderRepository.save(any(Order.class))).thenReturn(sampleOrder);

        orderService.updateOrderStatus(1L, "EN_REPARTO");

        ArgumentCaptor<Order> captor = ArgumentCaptor.forClass(Order.class);
        verify(orderRepository).save(captor.capture());
        assertThat(captor.getValue().getStatus()).isEqualTo(OrderStatus.EN_REPARTO);
    }

    @Test
    void updateOrderStatus_shouldIgnoreNonExistent() {
        when(orderRepository.findById(99L)).thenReturn(Optional.empty());

        orderService.updateOrderStatus(99L, "EN_REPARTO");

        verify(orderRepository, never()).save(any());
    }

    @Test
    void assignOrder_shouldSetTransporter() {
        when(orderRepository.findById(1L)).thenReturn(Optional.of(sampleOrder));
        when(orderRepository.save(any(Order.class))).thenReturn(sampleOrder);

        orderService.assignOrder(1L, "Luis Castro");

        ArgumentCaptor<Order> captor = ArgumentCaptor.forClass(Order.class);
        verify(orderRepository).save(captor.capture());
        assertThat(captor.getValue().getAssignedTo()).isEqualTo("Luis Castro");
    }

    @Test
    void getOrderById_shouldReturnOrderWhenFound() {
        when(orderRepository.findById(1L)).thenReturn(Optional.of(sampleOrder));

        Optional<Order> result = orderService.getOrderById(1L);

        assertThat(result).isPresent();
        assertThat(result.get().getId()).isEqualTo(1L);
    }

    @Test
    void getOrderById_shouldReturnEmptyWhenNotFound() {
        when(orderRepository.findById(99L)).thenReturn(Optional.empty());

        Optional<Order> result = orderService.getOrderById(99L);

        assertThat(result).isEmpty();
    }

    @Test
    void getAllOrders_shouldReturnAll() {
        Order order2 = Order.builder()
                .id(2L)
                .customerId(20L)
                .sku("SPRITE-2L")
                .quantity(3)
                .status(OrderStatus.EN_REPARTO)
                .build();
        when(orderRepository.findAll()).thenReturn(Arrays.asList(sampleOrder, order2));

        List<Order> result = orderService.getAllOrders();

        assertThat(result).hasSize(2);
        assertThat(result.get(0).getId()).isEqualTo(1L);
        assertThat(result.get(1).getId()).isEqualTo(2L);
    }
}
