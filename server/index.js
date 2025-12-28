/**
 * Nature on Zoom — WebSocket Server
 * Main entry point
 */

import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { setupHeartbeat } from './ws/heartbeat.js';
import apiRouter from './routes/api.js';

const PORT = process.env.PORT || 8765;
const app = express();

// Middleware
app.use(express.json());

// CORS for development
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// API routes
app.use('/api', apiRouter);

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// Create HTTP server
const server = createServer(app);

// Create WebSocket server
const wss = new WebSocketServer({
    server,
    path: '/ws/heartbeat'
});

// Setup WebSocket handlers
setupHeartbeat(wss);

// Start server
server.listen(PORT, () => {
    console.log(`🐦 Nature on Zoom Server running on port ${PORT}`);
    console.log(`   HTTP:      http://localhost:${PORT}`);
    console.log(`   WebSocket: ws://localhost:${PORT}/ws/heartbeat`);
    console.log(`   API:       http://localhost:${PORT}/api`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('Shutting down...');
    wss.clients.forEach(client => client.close());
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});
