package com.inventory_service.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.inventory_service.model.Inventory;
import com.inventory_service.service.InventoryService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(InventoryController.class)
class InventoryControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private InventoryService inventoryService;

    @Test
    void getAllInventory_shouldReturnOk() throws Exception {
        Inventory item1 = Inventory.builder()
                .id(1L)
                .sku("COCA-2L")
                .name("Coca-Cola 2L")
                .stock(48)
                .price(2200)
                .cost(1500)
                .category("bebidas")
                .build();
        Inventory item2 = Inventory.builder()
                .id(2L)
                .sku("PEPSI-2L")
                .name("Pepsi 2L")
                .stock(72)
                .price(2000)
                .cost(1400)
                .category("bebidas")
                .build();

        when(inventoryService.getAllInventory()).thenReturn(Arrays.asList(item1, item2));

        mockMvc.perform(get("/api/inventory"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].sku").value("COCA-2L"))
                .andExpect(jsonPath("$[1].sku").value("PEPSI-2L"));
    }

    @Test
    void getBySku_shouldReturnOkWhenFound() throws Exception {
        Inventory item = Inventory.builder()
                .id(1L)
                .sku("COCA-2L")
                .name("Coca-Cola 2L")
                .stock(48)
                .price(2200)
                .cost(1500)
                .category("bebidas")
                .build();

        when(inventoryService.getBySku("COCA-2L")).thenReturn(Optional.of(item));

        mockMvc.perform(get("/api/inventory/COCA-2L"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.sku").value("COCA-2L"))
                .andExpect(jsonPath("$.name").value("Coca-Cola 2L"))
                .andExpect(jsonPath("$.stock").value(48));
    }

    @Test
    void getBySku_shouldReturn404WhenNotFound() throws Exception {
        when(inventoryService.getBySku("NONEXISTENT")).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/inventory/NONEXISTENT"))
                .andExpect(status().isNotFound());
    }

    @Test
    void createInventory_shouldReturnCreated() throws Exception {
        Inventory input = Inventory.builder()
                .sku("SPRITE-2L")
                .name("Sprite 2L")
                .stock(65)
                .price(2000)
                .cost(1400)
                .category("bebidas")
                .build();
        Inventory created = Inventory.builder()
                .id(3L)
                .sku("SPRITE-2L")
                .name("Sprite 2L")
                .stock(65)
                .price(2000)
                .cost(1400)
                .category("bebidas")
                .build();

        when(inventoryService.createInventory(any(Inventory.class))).thenReturn(created);

        mockMvc.perform(post("/api/inventory")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(input)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(3))
                .andExpect(jsonPath("$.sku").value("SPRITE-2L"));
    }

    @Test
    void updateInventory_shouldReturnOkWhenFound() throws Exception {
        Inventory updates = Inventory.builder()
                .name("Coca-Cola 2L Retornable")
                .price(2500)
                .build();
        Inventory updated = Inventory.builder()
                .id(1L)
                .sku("COCA-2L")
                .name("Coca-Cola 2L Retornable")
                .stock(48)
                .price(2500)
                .cost(1500)
                .category("bebidas")
                .build();

        when(inventoryService.updateInventory(eq("COCA-2L"), any(Inventory.class)))
                .thenReturn(Optional.of(updated));

        mockMvc.perform(put("/api/inventory/COCA-2L")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updates)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Coca-Cola 2L Retornable"))
                .andExpect(jsonPath("$.price").value(2500));
    }

    @Test
    void updateInventory_shouldReturn404WhenNotFound() throws Exception {
        Inventory updates = Inventory.builder().name("Test").build();

        when(inventoryService.updateInventory(eq("NONEXISTENT"), any(Inventory.class)))
                .thenReturn(Optional.empty());

        mockMvc.perform(put("/api/inventory/NONEXISTENT")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updates)))
                .andExpect(status().isNotFound());
    }

    @Test
    void deleteInventory_shouldReturnNoContent() throws Exception {
        when(inventoryService.deleteInventory("COCA-2L")).thenReturn(true);

        mockMvc.perform(delete("/api/inventory/COCA-2L"))
                .andExpect(status().isNoContent());
    }

    @Test
    void deleteInventory_shouldReturn404WhenNotFound() throws Exception {
        when(inventoryService.deleteInventory("NONEXISTENT")).thenReturn(false);

        mockMvc.perform(delete("/api/inventory/NONEXISTENT"))
                .andExpect(status().isNotFound());
    }

    @Test
    void adjustStock_shouldReturnOk() throws Exception {
        Inventory adjusted = Inventory.builder()
                .id(1L)
                .sku("COCA-2L")
                .name("Coca-Cola 2L")
                .stock(58)
                .price(2200)
                .cost(1500)
                .category("bebidas")
                .build();

        when(inventoryService.adjustStock("COCA-2L", 10)).thenReturn(adjusted);

        mockMvc.perform(post("/api/inventory/COCA-2L/adjust")
                        .param("delta", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.stock").value(58));
    }

    @Test
    void adjustStock_shouldReturn404WhenSkuNotFound() throws Exception {
        when(inventoryService.adjustStock(eq("NONEXISTENT"), any()))
                .thenThrow(new RuntimeException("SKU not found: NONEXISTENT"));

        mockMvc.perform(post("/api/inventory/NONEXISTENT/adjust")
                        .param("delta", "5"))
                .andExpect(status().isNotFound());
    }
}
