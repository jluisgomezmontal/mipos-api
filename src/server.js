import app from './app.js';
import env from './config/env.js';
import connectDB from './config/database.js';

const startServer = async () => {
  try {
    await connectDB();

    const server = app.listen(env.PORT, () => {
      console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║              🚀 MiPOS Backend Server                 ║
║                                                       ║
║  Environment: ${env.NODE_ENV.padEnd(38)}  ║
║  Port:        ${String(env.PORT).padEnd(38)}  ║
║  Status:      Running ✓                              ║
║                                                       ║
║  API:         http://localhost:${env.PORT}/api/v1${' '.repeat(13)}  ║
║  Health:      http://localhost:${env.PORT}/api/v1/health${' '.repeat(6)}  ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
      `);
    });

    const gracefulShutdown = async (signal) => {
      console.log(`\n⚠️  ${signal} received. Starting graceful shutdown...`);
      
      server.close(async () => {
        console.log('✅ HTTP server closed');
        process.exit(0);
      });

      setTimeout(() => {
        console.error('❌ Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    process.on('unhandledRejection', (reason, promise) => {
      console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    });

    process.on('uncaughtException', (error) => {
      console.error('❌ Uncaught Exception:', error);
      process.exit(1);
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
