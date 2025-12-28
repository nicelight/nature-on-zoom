/**
 * Nature on Zoom — WebSocket Heartbeat Handler
 */

// Connected clients
const clients = new Map();

/**
 * Setup WebSocket heartbeat handlers
 */
export function setupHeartbeat(wss) {
    console.log('[WebSocket] Heartbeat handler initialized');

    wss.on('connection', (ws, req) => {
        const clientId = generateClientId();
        const clientIp = req.socket.remoteAddress;

        console.log(`[WebSocket] Client connected: ${clientId} from ${clientIp}`);

        // Store client
        clients.set(clientId, {
            ws,
            connectedAt: Date.now(),
            lastPing: Date.now()
        });

        // Handle messages
        ws.on('message', (data) => {
            try {
                const message = JSON.parse(data.toString());
                handleMessage(ws, clientId, message);
            } catch (error) {
                console.error('[WebSocket] Invalid message:', error.message);
                sendError(ws, 'INVALID_MESSAGE', 'Failed to parse message');
            }
        });

        // Handle disconnect
        ws.on('close', () => {
            console.log(`[WebSocket] Client disconnected: ${clientId}`);
            clients.delete(clientId);
        });

        // Handle errors
        ws.on('error', (error) => {
            console.error(`[WebSocket] Client error ${clientId}:`, error.message);
        });
    });

    // Cleanup stale connections every minute
    setInterval(() => {
        const now = Date.now();
        const timeout = 120000; // 2 minutes

        clients.forEach((client, id) => {
            if (now - client.lastPing > timeout) {
                console.log(`[WebSocket] Closing stale connection: ${id}`);
                client.ws.close();
                clients.delete(id);
            }
        });
    }, 60000);

    // Broadcast stream updates every 30 seconds (simulation)
    setInterval(() => {
        broadcastStreamUpdates(wss);
    }, 30000);
}

/**
 * Handle incoming message
 */
function handleMessage(ws, clientId, message) {
    const { type, timestamp } = message;

    switch (type) {
        case 'ping':
            // Update last ping time
            const client = clients.get(clientId);
            if (client) {
                client.lastPing = Date.now();
            }

            // Send pong response
            ws.send(JSON.stringify({
                type: 'pong',
                timestamp: timestamp,
                serverTime: Date.now()
            }));

            console.log(`[WebSocket] Ping/Pong for client: ${clientId}`);
            break;

        default:
            sendError(ws, 'UNKNOWN_TYPE', `Unknown message type: ${type}`);
    }
}

/**
 * Send error message
 */
function sendError(ws, code, message) {
    ws.send(JSON.stringify({
        type: 'error',
        code,
        message
    }));
}

/**
 * Broadcast stream updates to all clients
 */
function broadcastStreamUpdates(wss) {
    const streams = ['eagle', 'owl', 'hummingbird', 'osprey', 'falcon', 'heron', 'penguin', 'flamingo'];
    const baseViewers = [142, 89, 234, 67, 178, 45, 312, 198];

    wss.clients.forEach((client) => {
        if (client.readyState === 1) { // WebSocket.OPEN
            // Pick a random stream to update
            const index = Math.floor(Math.random() * streams.length);
            const streamId = streams[index];
            const base = baseViewers[index];
            const variance = Math.floor(base * 0.3);
            const viewers = base + Math.floor(Math.random() * variance * 2) - variance;

            client.send(JSON.stringify({
                type: 'stream_update',
                streamId,
                viewers,
                timestamp: Date.now()
            }));
        }
    });
}

/**
 * Generate unique client ID
 */
function generateClientId() {
    return 'client_' + Math.random().toString(36).substring(2, 15);
}

export { clients };
