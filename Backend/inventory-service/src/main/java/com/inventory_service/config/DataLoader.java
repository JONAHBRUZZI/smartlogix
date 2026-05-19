package com.inventory_service.config;

import com.inventory_service.model.Inventory;
import com.inventory_service.repository.InventoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Slf4j
@Configuration
@RequiredArgsConstructor
public class DataLoader implements CommandLineRunner {

    private final InventoryRepository inventoryRepository;

    @Override
    public void run(String... args) throws Exception {
        if (inventoryRepository.count() == 0) {
            log.info("Poblando inventario inicial - Negocio de Bebidas y Confites...");

            List<Inventory> initialStock = List.of(
                    Inventory.builder().sku(100001L).stock(48).build(),
                    Inventory.builder().sku(100002L).stock(72).build(),
                    Inventory.builder().sku(100003L).stock(65).build(),
                    Inventory.builder().sku(100004L).stock(120).build(),
                    Inventory.builder().sku(100005L).stock(35).build(),
                    Inventory.builder().sku(100006L).stock(90).build(),
                    Inventory.builder().sku(100007L).stock(3).build(),
                    Inventory.builder().sku(100008L).stock(15).build(),
                    Inventory.builder().sku(100009L).stock(8).build(),
                    Inventory.builder().sku(100010L).stock(2).build()
            );

            inventoryRepository.saveAll(initialStock);
            log.info("Inventario inicial cargado: 10 productos.");
        } else {
            log.info("El inventario ya contiene datos, saltando carga inicial.");
        }
    }
}
