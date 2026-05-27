const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const pool = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8084;
const NOTIFICATION_URL = process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:8085';
const PROCESSED_EVENTS = new Set();

async function ensureTables() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS shipments (
      id SERIAL PRIMARY KEY,
      order_id INTEGER NOT NULL,
      customer_id INTEGER NOT NULL,
      sku INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      status VARCHAR(30) NOT NULL DEFAULT 'EN_PREPARACION',
      tracking_number VARCHAR(20),
      created_at TIMESTAMP DEFAULT NOW(),
      shipped_at TIMESTAMP,
      customer_code VARCHAR(20),
      recipient_rut VARCHAR(15),
      proof_of_delivery_image TEXT
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

async function sendNotification(shipment, stage, message) {
  try {
    const body = {
      eventId: uuidv4(),
      orderId: shipment.order_id,
      customerId: shipment.customer_id,
      stage,
      status: shipment.status,
      message,
      sourceService: 'shipping-service',
      audience: 'BOTH',
      occurredAt: new Date().toISOString(),
      version: '1',
    };

    await fetch(`${NOTIFICATION_URL}/api/notifications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    console.log(`Notification ${stage} sent for order ${shipment.order_id}`);
  } catch (err) {
    console.error(`Error sending notification for order ${shipment.order_id}:`, err.message);
  }
}

// GET /api/shipments
app.get('/api/shipments', async (_req, res) => {
  try {
    const result = await pool.query('SELECT * FROM shipments ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/shipments/:orderId
app.get('/api/shipments/:orderId', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM shipments WHERE order_id = $1', [req.params.orderId]);
    if (!result.rows.length) return res.status(404).json({ error: 'Envio no encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/shipments
app.post('/api/shipments', async (req, res) => {
  try {
    const { orderId, customerId, sku, quantity } = req.body;

    const existing = await pool.query('SELECT * FROM shipments WHERE order_id = $1', [orderId]);
    if (existing.rows.length) return res.status(409).json({ error: `Ya existe un envio para la orden ${orderId}` });

    const tracking = 'TRACK-' + uuidv4().substring(0, 8).toUpperCase();

    const result = await pool.query(
      `INSERT INTO shipments (order_id, customer_id, sku, quantity, status, tracking_number, created_at)
       VALUES ($1, $2, $3, $4, 'EN_PREPARACION', $5, NOW()) RETURNING *`,
      [orderId, customerId, sku, quantity, tracking]
    );

    const shipment = result.rows[0];
    console.log(`[SHIPPING] Envio creado ID:${shipment.id} Tracking:${tracking}`);

    await sendNotification(shipment, 'SHIPMENT_CREATED', `Envio creado con tracking ${tracking}`);

    res.status(201).json(shipment);
  } catch (err) {
    console.error('Error creando envio:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/shipments/:id/stage?stage=EN_REPARTO | ENTREGADO | CANCELADO
app.put('/api/shipments/:id/stage', async (req, res) => {
  try {
    const { id } = req.params;
    const stage = (req.query.stage || '').toUpperCase();

    const shipResult = await pool.query('SELECT * FROM shipments WHERE id = $1', [id]);
    if (!shipResult.rows.length) return res.status(404).json({ error: 'Envio no encontrado' });

    const shipment = shipResult.rows[0];

    if (stage === 'EN_REPARTO') {
      await pool.query(
        "UPDATE shipments SET status = 'EN_REPARTO', shipped_at = NOW() WHERE id = $1",
        [id]
      );
      const updated = await pool.query('SELECT * FROM shipments WHERE id = $1', [id]);
      await sendNotification(updated.rows[0], 'SHIPMENT_IN_TRANSIT',
        `Envio en reparto - Tracking: ${updated.rows[0].tracking_number}`);
      return res.json(updated.rows[0]);

    } else if (stage === 'ENTREGADO') {
      const proof = req.body || {};
      await pool.query(
        `UPDATE shipments SET status = 'ENTREGADO', customer_code = $1, recipient_rut = $2, proof_of_delivery_image = $3 WHERE id = $4`,
        [proof.customerCode || '', proof.recipientRut || '', proof.proofOfDeliveryImage || '', id]
      );
      const updated = await pool.query('SELECT * FROM shipments WHERE id = $1', [id]);
      await sendNotification(updated.rows[0], 'SHIPMENT_DELIVERED',
        `Envio entregado - Tracking: ${updated.rows[0].tracking_number}`);
      return res.json(updated.rows[0]);

    } else if (stage === 'CANCELADO') {
      await pool.query("UPDATE shipments SET status = 'CANCELADO' WHERE id = $1", [id]);
      const updated = await pool.query('SELECT * FROM shipments WHERE id = $1', [id]);
      await sendNotification(updated.rows[0], 'SHIPMENT_CANCELLED',
        `Envio cancelado - Tracking: ${updated.rows[0].tracking_number}`);
      return res.json(updated.rows[0]);

    } else {
      await pool.query('UPDATE shipments SET status = $1 WHERE id = $2', [stage, id]);
      const updated = await pool.query('SELECT * FROM shipments WHERE id = $1', [id]);
      return res.json(updated.rows[0]);
    }
  } catch (err) {
    console.error('Error cambiando etapa:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/shipments/:id/qr
app.get('/api/shipments/:id/qr', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM shipments WHERE id = $1', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Envio no encontrado' });
    res.json({ qrCode: 'SMARTLOGIX-' + result.rows[0].tracking_number });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// SQS consumer: shipping-queue
async function pollSqs() {
  const { SQSClient, ReceiveMessageCommand, DeleteMessageCommand } = require('@aws-sdk/client-sqs');

  const sqs = new SQSClient({
    region: process.env.AWS_REGION || 'us-east-1',
    endpoint: process.env.AWS_SQS_ENDPOINT || 'http://localhost:4566',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'test',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'test',
    },
    forcePathStyle: true,
  });

  const endpoint = process.env.AWS_SQS_ENDPOINT || 'http://localhost:4566';
  const queueUrl = `${endpoint}/queue/shipping-queue`;

  while (true) {
    try {
      const data = await sqs.send(new ReceiveMessageCommand({
        QueueUrl: queueUrl, MaxNumberOfMessages: 5, WaitTimeSeconds: 10,
      }));
      if (data.Messages) {
        for (const msg of data.Messages) {
          try {
            const body = JSON.parse(msg.Body);
            const eventKey = `SHIPPING_CREATED:${body.orderId}`;

            if (PROCESSED_EVENTS.has(eventKey)) {
              await sqs.send(new DeleteMessageCommand({ QueueUrl: queueUrl, ReceiptHandle: msg.ReceiptHandle }));
              continue;
            }

            if (body.eventType === 'SHIPPING_CREATED') {
              const existing = await pool.query('SELECT * FROM shipments WHERE order_id = $1', [body.orderId]);
              if (!existing.rows.length) {
                const tracking = 'TRACK-' + uuidv4().substring(0, 8).toUpperCase();
                const result = await pool.query(
                  `INSERT INTO shipments (order_id, customer_id, sku, quantity, status, tracking_number, created_at)
                   VALUES ($1, $2, $3, $4, 'EN_PREPARACION', $5, NOW()) RETURNING *`,
                  [body.orderId, body.customerId, body.sku, body.quantity, tracking]
                );
                await sendNotification(result.rows[0], 'SHIPMENT_CREATED',
                  `Envio creado con tracking ${tracking}`);
              }
              PROCESSED_EVENTS.add(eventKey);
            }

            await sqs.send(new DeleteMessageCommand({ QueueUrl: queueUrl, ReceiptHandle: msg.ReceiptHandle }));
          } catch (e) {
            console.error('Error procesando mensaje shipping:', e.message);
          }
        }
      }
    } catch (err) {
      console.error('SQS poll error:', err.message);
      await new Promise(r => setTimeout(r, 5000));
    }
  }
}

async function start() {
  await ensureTables();
  app.listen(PORT, () => console.log(`shipping-service running on port ${PORT}`));
  pollSqs().catch(err => console.error('SQS poller error:', err.message));
}

start();
