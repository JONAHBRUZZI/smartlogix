const express = require('express');
const cors = require('cors');
const pool = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8085;

async function ensureTables() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS notification_records (
      id SERIAL PRIMARY KEY,
      event_id VARCHAR(64) NOT NULL,
      order_id INTEGER NOT NULL,
      customer_id INTEGER NOT NULL,
      stage VARCHAR(40) NOT NULL,
      status VARCHAR(30) NOT NULL,
      message VARCHAR(500) NOT NULL,
      target_audience VARCHAR(20) NOT NULL,
      source_service VARCHAR(50) NOT NULL,
      occurred_at TIMESTAMP NOT NULL,
      received_at TIMESTAMP DEFAULT NOW()
    )
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_notification_order_id ON notification_records (order_id)
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_notification_audience ON notification_records (target_audience)
  `);
  // Unique constraint to avoid duplicates
  await pool.query(`
    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uk_notification_event_audience') THEN
        ALTER TABLE notification_records ADD CONSTRAINT uk_notification_event_audience UNIQUE (event_id, target_audience);
      END IF;
    END $$;
  `);
}

// POST /api/notifications
app.post('/api/notifications', async (req, res) => {
  try {
    const event = req.body;
    const audience = event.audience || 'BOTH';

    // Check for duplicate
    const existing = await pool.query(
      'SELECT id FROM notification_records WHERE event_id = $1 AND target_audience = $2',
      [event.eventId, audience]
    );
    if (existing.rows.length) {
      return res.status(202).json({ status: 'DUPLICATE', eventId: event.eventId });
    }

    await pool.query(
      `INSERT INTO notification_records
       (event_id, order_id, customer_id, stage, status, message, target_audience, source_service, occurred_at, received_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())`,
      [event.eventId, event.orderId, event.customerId, event.stage, event.status,
       event.message, audience, event.sourceService, event.occurredAt]
    );

    console.log(`Notification persisted: ${event.stage} order=${event.orderId}`);
    res.status(202).json({ status: 'ACCEPTED', eventId: event.eventId });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(202).json({ status: 'DUPLICATE', eventId: req.body.eventId });
    }
    console.error('Error persisting notification:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/notifications/order/:orderId
app.get('/api/notifications/order/:orderId', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM notification_records WHERE order_id = $1 ORDER BY occurred_at ASC',
      [req.params.orderId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/notifications/audience/:audience
app.get('/api/notifications/audience/:audience', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM notification_records WHERE target_audience = $1 ORDER BY occurred_at DESC',
      [req.params.audience.toUpperCase()]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

async function start() {
  await ensureTables();
  app.listen(PORT, () => console.log(`notification-service running on port ${PORT}`));
}

app.get('/health', (_req, res) => res.json({ status: 'UP' }));

start();
