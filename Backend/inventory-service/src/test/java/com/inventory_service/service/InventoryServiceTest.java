package com.inventory_service.service;

import com.inventory_service.model.Inventory;
import com.inventory_service.repository.InventoryRepository;
import com.smartlogix.contracts.events.InventoryResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class InventoryServiceTest {

    @Mock
    private InventoryRepository inventoryRepository;

    @InjectMocks
    private InventoryService inventoryService;

    private Inventory sampleInventory;

    @BeforeEach
    void setUp() {
        sampleInventory = Inventory.builder()
                .id(1L)
                .sku("COCA-2L")
                .name("Coca-Cola 2L")
                .stock(50)
                .price(2200)
                .cost(1500)
                .category("bebidas")
                .build();
    }

    @Test
    void getAllInventory_shouldReturnAll() {
        Inventory item2 = Inventory.builder()
                .id(2L)
                .sku("PEPSI-2L")
                .name("Pepsi 2L")
                .stock(72)
                .price(2000)
                .cost(1400)
                .category("bebidas")
                .build();
        when(inventoryRepository.findAll()).thenReturn(Arrays.asList(sampleInventory, item2));

        List<Inventory> result = inventoryService.getAllInventory();

        assertThat(result).hasSize(2);
    }

    @Test
    void getBySku_shouldReturnWhenFound() {
        when(inventoryRepository.findBySku("COCA-2L")).thenReturn(Optional.of(sampleInventory));

        Optional<Inventory> result = inventoryService.getBySku("COCA-2L");

        assertThat(result).isPresent();
        assertThat(result.get().getSku()).isEqualTo("COCA-2L");
    }

    @Test
    void getBySku_shouldReturnEmptyWhenNotFound() {
        when(inventoryRepository.findBySku("NONEXISTENT")).thenReturn(Optional.empty());

        Optional<Inventory> result = inventoryService.getBySku("NONEXISTENT");

        assertThat(result).isEmpty();
    }

    @Test
    void createInventory_shouldNormalizeSkuAndSave() {
        Inventory input = Inventory.builder()
                .sku("coca cola  2l")
                .name("Coca-Cola 2L")
                .stock(50)
                .price(2200)
                .cost(1500)
                .category("bebidas")
                .build();
        when(inventoryRepository.save(any(Inventory.class))).thenReturn(sampleInventory);

        inventoryService.createInventory(input);

        ArgumentCaptor<Inventory> captor = ArgumentCaptor.forClass(Inventory.class);
        verify(inventoryRepository).save(captor.capture());
        assertThat(captor.getValue().getSku()).isEqualTo("COCA-COLA-2L");
    }

    @Test
    void updateInventory_shouldUpdateFields() {
        Inventory updates = Inventory.builder()
                .name("Coca-Cola 2L Retornable")
                .price(2500)
                .build();
        when(inventoryRepository.findBySku("COCA-2L")).thenReturn(Optional.of(sampleInventory));
        when(inventoryRepository.save(any(Inventory.class))).thenReturn(sampleInventory);

        Optional<Inventory> result = inventoryService.updateInventory("COCA-2L", updates);

        assertThat(result).isPresent();
        verify(inventoryRepository).save(any(Inventory.class));
    }

    @Test
    void updateInventory_shouldReturnEmptyWhenNotFound() {
        when(inventoryRepository.findBySku("NONEXISTENT")).thenReturn(Optional.empty());

        Optional<Inventory> result = inventoryService.updateInventory("NONEXISTENT", Inventory.builder().build());

        assertThat(result).isEmpty();
        verify(inventoryRepository, never()).save(any());
    }

    @Test
    void deleteInventory_shouldReturnTrueWhenExists() {
        when(inventoryRepository.existsBySku("COCA-2L")).thenReturn(true);

        boolean result = inventoryService.deleteInventory("COCA-2L");

        assertThat(result).isTrue();
        verify(inventoryRepository).deleteBySku("COCA-2L");
    }

    @Test
    void deleteInventory_shouldReturnFalseWhenNotFound() {
        when(inventoryRepository.existsBySku("NONEXISTENT")).thenReturn(false);

        boolean result = inventoryService.deleteInventory("NONEXISTENT");

        assertThat(result).isFalse();
        verify(inventoryRepository, never()).deleteBySku(any());
    }

    @Test
    void adjustStock_shouldAddDelta() {
        when(inventoryRepository.findBySku("COCA-2L")).thenReturn(Optional.of(sampleInventory));
        when(inventoryRepository.save(any(Inventory.class))).thenReturn(sampleInventory);

        Inventory result = inventoryService.adjustStock("COCA-2L", 10);

        assertThat(result.getStock()).isEqualTo(60);
    }

    @Test
    void adjustStock_shouldNotGoBelowZero() {
        when(inventoryRepository.findBySku("COCA-2L")).thenReturn(Optional.of(sampleInventory));
        when(inventoryRepository.save(any(Inventory.class))).thenReturn(sampleInventory);

        Inventory result = inventoryService.adjustStock("COCA-2L", -100);

        assertThat(result.getStock()).isEqualTo(0);
    }

    @Test
    void adjustStock_shouldThrowWhenSkuNotFound() {
        when(inventoryRepository.findBySku("NONEXISTENT")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> inventoryService.adjustStock("NONEXISTENT", 5))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("NONEXISTENT");
    }

    @Test
    void deductStock_shouldSucceedWithSufficientStock() {
        when(inventoryRepository.findBySku("COCA-2L")).thenReturn(Optional.of(sampleInventory));
        when(inventoryRepository.save(any(Inventory.class))).thenReturn(sampleInventory);

        InventoryResponse response = inventoryService.deductStock(1L, "COCA-2L", 10);

        assertThat(response.isSuccess()).isTrue();
        assertThat(response.getMessage()).isEqualTo("Inventory updated");
        assertThat(response.getOrderId()).isEqualTo(1L);
    }

    @Test
    void deductStock_shouldFailWithInsufficientStock() {
        when(inventoryRepository.findBySku("COCA-2L")).thenReturn(Optional.of(sampleInventory));

        InventoryResponse response = inventoryService.deductStock(1L, "COCA-2L", 1000);

        assertThat(response.isSuccess()).isFalse();
        assertThat(response.getMessage()).contains("Insufficient stock");
    }

    @Test
    void deductStock_shouldFailWhenSkuNotFound() {
        when(inventoryRepository.findBySku("NONEXISTENT")).thenReturn(Optional.empty());

        InventoryResponse response = inventoryService.deductStock(1L, "NONEXISTENT", 10);

        assertThat(response.isSuccess()).isFalse();
        assertThat(response.getMessage()).contains("SKU not found");
    }

    @Test
    void deductStock_shouldFailWithNullSku() {
        InventoryResponse response = inventoryService.deductStock(1L, null, 10);

        assertThat(response.isSuccess()).isFalse();
        assertThat(response.getMessage()).contains("Invalid order payload");
    }

    @Test
    void deductStock_shouldFailWithNullQuantity() {
        InventoryResponse response = inventoryService.deductStock(1L, "COCA-2L", null);

        assertThat(response.isSuccess()).isFalse();
        assertThat(response.getMessage()).contains("Invalid order payload");
    }

    @Test
    void deductStock_shouldFailWithZeroQuantity() {
        InventoryResponse response = inventoryService.deductStock(1L, "COCA-2L", 0);

        assertThat(response.isSuccess()).isFalse();
        assertThat(response.getMessage()).contains("Invalid order payload");
    }
}
