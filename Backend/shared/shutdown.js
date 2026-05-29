function gracefulShutdown(server, pool, sqs, serviceName) {
  const shutdown = async (signal) => {
    console.log(`${serviceName}: ${signal} received, shutting down...`);
    server.close(() => console.log(`${serviceName}: HTTP server closed`));
    if (pool) await pool.end().catch(() => {});
    if (sqs) sqs.destroy();
    process.exit(0);
  };
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

module.exports = { gracefulShutdown };
