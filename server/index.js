const config = require('./config/env');
const connectDB = require('./config/db');
const app = require('./app');

async function main() {
  try {
    await connectDB();
    // eslint-disable-next-line no-console
    console.log(`MongoDB connected: ${config.mongoUri.replace(/\/\/.*@/, '//***@')}`);
    app.listen(config.port, '0.0.0.0', () => {
      // eslint-disable-next-line no-console
      console.log(`GMMC API listening on port ${config.port} (${config.nodeEnv})`);
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
}

main();
