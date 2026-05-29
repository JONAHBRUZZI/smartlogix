const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const pool = require('./db');
const { sendMessage } = require('./sqs');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8081;
const ORDERS_QUEUE = process.env.ORDERS_QUEUE || 'orders-queue';

async function ensureTables() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      customer_id INTEGER NOT NULL,
      sku INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      status VARCHAR(30) NOT NULL DEFAULT 'CREATED',
      created_at TIMESTAMP DEFAULT NOW(),
      assigned_to VARCHAR(100),
      cancel_reason VARCHAR(255)
    )
  `);
}

// Test endpoint
app.get('/api/orders/test', (_req, res) => {
  res.send('El controlador de Ordenes de SmartLogix esta activo!');
});

// Crear orden
app.post('/api/orders', async (req, res) => {
  try {
    const { customerId, sku, quantity } = req.body;
    const result = await pool.query(
      `INSERT INTO orders (customer_id, sku, quantity, status, created_at)
       VALUES ($1, $2, $3, 'CREATED', NOW()) RETURNING *`,
      [customerId, sku, quantity]
    );
    const order = result.rows[0];
    res.status(201).json({
      orderId: order.id,
      status: order.status,
      message: 'Orden creada correctamente',
      createdAt: order.created_at,
    });
  } catch (err) {
    console.error('Error creando orden:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Listar todas las ordenes
app.get('/api/orders', async (_req, res) => {
  try {
    const result = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Cambiar estado
app.put('/api/orders/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.query;
    const result = await pool.query(
      'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Orden no encontrada' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Confirmar orden
app.put('/api/orders/:id/confirm', async (req, res) => {
  try {
    const { id } = req.params;
    const orderResult = await pool.query('SELECT * FROM orders WHERE id = $1', [id]);
    if (!orderResult.rows.length) return res.status(404).json({ error: 'Orden no encontrada' });

    const order = orderResult.rows[0];

    // Ajustar inventario via REST
    try {
      await fetch(`http://inventory-service:8082/api/inventory/${order.sku}/adjust?delta=-${order.quantity}`, {
        method: 'POST',
      });
    } catch (e) {
      console.error('Error ajustando inventario:', e.message);
    }

    // Crear envio via REST
    try {
      await fetch('http://shipping-service:8084/api/shipments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: parseInt(id),
          customerId: order.customer_id,
          sku: order.sku,
          quantity: order.quantity,
        }),
      });
    } catch (e) {
      console.error('Error creando envio:', e.message);
    }

    // Publicar evento SQS
    try {
      await sendMessage(ORDERS_QUEUE, {
        eventId: uuidv4(),
        orderId: parseInt(id),
        customerId: order.customer_id,
        sku: order.sku,
        quantity: order.quantity,
        eventType: 'ORDER_CONFIRMED',
        timestamp: new Date().toISOString(),
      });
    } catch (e) {
      console.error('Error publicando a SQS:', e.message);
    }

    // Actualizar estado
    await pool.query(
      "UPDATE orders SET status = 'EN_PREPARACION' WHERE id = $1",
      [id]
    );

    const updated = await pool.query('SELECT * FROM orders WHERE id = $1', [id]);
    res.json(updated.rows[0]);
  } catch (err) {
    console.error('Error confirmando:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Cancelar orden
app.put('/api/orders/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params;
    const orderResult = await pool.query('SELECT * FROM orders WHERE id = $1', [id]);
    if (!orderResult.rows.length) return res.status(404).json({ error: 'Orden no encontrada' });

    const order = orderResult.rows[0];
    const reason = req.body.reason || '';

    if (order.status === 'EN_PREPARACION') {
      try {
        await fetch(`http://inventory-service:8082/api/inventory/${order.sku}/adjust?delta=+${order.quantity}`, {
          method: 'POST',
        });
      } catch (e) {
        console.error('Error restaurando stock:', e.message);
      }
    }

    await pool.query(
      "UPDATE orders SET status = 'CANCELADO', cancel_reason = $1 WHERE id = $2",
      [reason, id]
    );

    const updated = await pool.query('SELECT * FROM orders WHERE id = $1', [id]);
    res.json(updated.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Asignar transportista
app.put('/api/orders/:id/assign', async (req, res) => {
  try {
    const { id } = req.params;
    const { transporter } = req.query;
    const result = await pool.query(
      'UPDATE orders SET assigned_to = $1 WHERE id = $2 RETURNING *',
      [transporter, id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Orden no encontrada' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Health check
app.get('/health', (_req, res) => res.json({ status: 'UP' }));

async function start() {
  await ensureTables();
  app.listen(PORT, () => console.log(`orders-service running on port ${PORT}`));
}
start();
