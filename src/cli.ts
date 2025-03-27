#!/usr/bin/env node

import { StrategicCoDeveloperServer } from './server.js';

// Parse config from command line
const config = JSON.parse(process.argv.find(arg => arg.startsWith('--config='))?.split('=')[1] || '{}');

// Start the server
const server = new StrategicCoDeveloperServer(config);

server.start().then(() => {
  console.log('Strategic Co-Developer MCP server started');
}).catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
});