const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const pool = require('./db');
const { sendMessage } = require('./sqs');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8082;
const SHIPPING_QUEUE = process.env.SHIPPING_QUEUE || 'shipping-queue';
const PROCESSED_EVENTS = new Set();

async function ensureTables() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS inventory (
      id SERIAL PRIMARY KEY,
      sku INTEGER NOT NULL,
      stock INTEGER NOT NULL DEFAULT 0
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS sales (
      id SERIAL PRIMARY KEY,
      sku INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      sale_date TIMESTAMP DEFAULT NOW()
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS processed_events (
      event_type VARCHAR(64) NOT NULL,
      event_key VARCHAR(128) NOT NULL,
      processed_at TIMESTAMP DEFAULT NOW(),
      PRIMARY KEY (event_type, event_key)
    )
  `);
}

// GET /api/inventory
app.get('/api/inventory', async (_req, res) => {
  try {
    const result = await pool.query('SELECT * FROM inventory ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/inventory/:sku
app.get('/api/inventory/:sku', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM inventory WHERE sku = $1', [req.params.sku]);
    if (!result.rows.length) return res.status(404).json({ error: 'SKU no encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/inventory (agregar nuevo producto)
app.post('/api/inventory', async (req, res) => {
  try {
    const { sku, stock } = req.body;
    const existing = await pool.query('SELECT * FROM inventory WHERE sku = $1', [sku]);
    if (existing.rows.length) return res.status(409).json({ error: 'SKU ya existe' });

    const result = await pool.query(
      'INSERT INTO inventory (sku, stock) VALUES ($1, $2) RETURNING *',
      [sku, stock || 0]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/inventory/:sku (actualizar stock)
app.put('/api/inventory/:sku', async (req, res) => {
  try {
    const { stock } = req.body;
    const result = await pool.query(
      'UPDATE inventory SET stock = $1 WHERE sku = $2 RETURNING *',
      [stock, req.params.sku]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'SKU no encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/inventory/:sku/adjust?delta=+5 or delta=-3
app.post('/api/inventory/:sku/adjust', async (req, res) => {
  try {
    const delta = parseInt(req.query.delta) || 0;
    const invResult = await pool.query('SELECT * FROM inventory WHERE sku = $1', [req.params.sku]);
    if (!invResult.rows.length) return res.status(404).json({ error: 'SKU no encontrado' });

    const inventory = invResult.rows[0];
    const newStock = inventory.stock + delta;
    if (newStock < 0) return res.status(400).json({ error: 'Stock insuficiente' });

    await pool.query('UPDATE inventory SET stock = $1 WHERE sku = $2', [newStock, req.params.sku]);

    // Si es venta, registrar
    if (delta < 0) {
      await pool.query(
        'INSERT INTO sales (sku, quantity) VALUES ($1, $2)',
        [req.params.sku, Math.abs(delta)]
      );
    }

    res.json({ sku: req.params.sku, stock: newStock, delta });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/sales
app.get('/api/sales', async (_req, res) => {
  try {
    const result = await pool.query('SELECT * FROM sales ORDER BY sale_date DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/sales
app.post('/api/sales', async (req, res) => {
  try {
    const { sku, quantity } = req.body;
    // Ajustar inventario
    const invResult = await pool.query('SELECT * FROM inventory WHERE sku = $1', [sku]);
    if (!invResult.rows.length) return res.status(404).json({ error: 'SKU no encontrado' });

    if (invResult.rows[0].stock < quantity) return res.status(400).json({ error: 'Stock insuficiente' });

    await pool.query('UPDATE inventory SET stock = stock - $1 WHERE sku = $2', [quantity, sku]);
    const result = await pool.query(
      'INSERT INTO sales (sku, quantity) VALUES ($1, $2) RETURNING *',
      [sku, quantity]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Consumir SQS orders-queue (polling cada 5s)
async function pollSqs(queueName, handler) {
  const { sqs, getQueueUrl } = require('./sqs');
  const { ReceiveMessageCommand, DeleteMessageCommand } = require('@aws-sdk/client-sqs');

  while (true) {
    try {
      const cmd = new ReceiveMessageCommand({
        QueueUrl: getQueueUrl(queueName),
        MaxNumberOfMessages: 5,
        WaitTimeSeconds: 10,
      });
      const data = await sqs.send(cmd);
      if (data.Messages) {
        for (const msg of data.Messages) {
          try {
            const body = JSON.parse(msg.Body);
            const eventKey = `ORDER_CONFIRMED:${body.orderId}`;

            if (PROCESSED_EVENTS.has(eventKey)) {
              await sqs.send(new DeleteMessageCommand({
                QueueUrl: getQueueUrl(queueName),
                ReceiptHandle: msg.ReceiptHandle,
              }));
              continue;
            }

            await handler(body);
            PROCESSED_EVENTS.add(eventKey);

            // Persistir idempotencia
            await pool.query(
              'INSERT INTO processed_events (event_type, event_key) VALUES ($1, $2) ON CONFLICT DO NOTHING',
              ['ORDER_CONFIRMED', eventKey]
            );

            await sqs.send(new DeleteMessageCommand({
              QueueUrl: getQueueUrl(queueName),
              ReceiptHandle: msg.ReceiptHandle,
            }));
          } catch (e) {
            console.error('Error procesando mensaje SQS:', e.message);
          }
        }
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('SQS poll error:', err.message);
      }
      await new Promise(r => setTimeout(r, 5000));
    }
  }
}

// Handler: cuando llega un ORDER_CONFIRMED, publicar envio
async function handleOrderConfirmed(event) {
  console.log(`[INVENTORY] Orden confirmada #${event.orderId}, SKU: ${event.sku}, Qty: ${event.quantity}`);

  await sendMessage(SHIPPING_QUEUE, {
    eventId: uuidv4(),
    orderId: event.orderId,
    customerId: event.customerId,
    sku: event.sku,
    quantity: event.quantity,
    eventType: 'SHIPPING_CREATED',
    timestamp: new Date().toISOString(),
  });
}

async function start() {
  await ensureTables();
  app.listen(PORT, () => console.log(`inventory-service running on port ${PORT}`));
  pollSqs('orders-queue', handleOrderConfirmed).catch(err =>
    console.error('SQS poller error:', err.message)
  );
}

// Health check
app.get('/health', (_req, res) => res.json({ status: 'UP' }));

start();
