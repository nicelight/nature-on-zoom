/**
 * Nature on Zoom — WebSocket Client
 * Handles heartbeat connection for DPI simulation
 */

class HeartbeatClient {
    constructor() {
        this.ws = null;
        this.clientId = this.generateClientId();
        this.pingTimer = null;
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
    }

    /**
     * Generate unique client ID
     */
    generateClientId() {
        if (typeof crypto !== 'undefined' && crypto.randomUUID) {
            return crypto.randomUUID();
        }
        // Fallback for older browsers
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    /**
     * Connect to WebSocket server
     */
    connect() {
        // Skip WebSocket in development if no server
        if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
            console.log('[WebSocket] Development mode - simulating connection');
            this.simulateConnection();
            return;
        }

        try {
            this.ws = new WebSocket(CONFIG.WS_URL);

            this.ws.onopen = () => {
                console.log('[WebSocket] Connected');
                this.isConnected = true;
                this.reconnectAttempts = 0;
                this.startPing();
            };

            this.ws.onmessage = (event) => {
                this.handleMessage(event.data);
            };

            this.ws.onclose = () => {
                console.log('[WebSocket] Disconnected');
                this.isConnected = false;
                this.stopPing();
                this.scheduleReconnect();
            };

            this.ws.onerror = (error) => {
                console.error('[WebSocket] Error:', error);
            };
        } catch (error) {
            console.error('[WebSocket] Connection failed:', error);
            this.simulateConnection();
        }
    }

    /**
     * Simulate connection for development/fallback
     */
    simulateConnection() {
        this.isConnected = true;
        console.log('[WebSocket] Simulation mode active');

        // Simulate periodic "pong" responses
        this.pingTimer = setInterval(() => {
            const latency = Math.floor(Math.random() * 50) + 10;
            console.log(`[WebSocket] Simulated ping/pong - latency: ${latency}ms`);
        }, CONFIG.HEARTBEAT_INTERVAL);
    }

    /**
     * Start sending ping messages
     */
    startPing() {
        this.stopPing();

        // Send initial ping
        this.sendPing();

        // Schedule periodic pings
        this.pingTimer = setInterval(() => {
            this.sendPing();
        }, CONFIG.HEARTBEAT_INTERVAL);
    }

    /**
     * Stop ping timer
     */
    stopPing() {
        if (this.pingTimer) {
            clearInterval(this.pingTimer);
            this.pingTimer = null;
        }
    }

    /**
     * Send ping message
     */
    sendPing() {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            return;
        }

        const message = JSON.stringify({
            type: 'ping',
            timestamp: Date.now(),
            clientId: this.clientId
        });

        this.ws.send(message);
        console.log('[WebSocket] Ping sent');
    }

    /**
     * Handle incoming message
     */
    handleMessage(data) {
        try {
            const message = JSON.parse(data);

            switch (message.type) {
                case 'pong':
                    const latency = Date.now() - message.timestamp;
                    console.log(`[WebSocket] Pong received - latency: ${latency}ms`);
                    break;

                case 'stream_update':
                    this.handleStreamUpdate(message);
                    break;

                case 'error':
                    console.error('[WebSocket] Server error:', message.message);
                    break;

                default:
                    console.log('[WebSocket] Unknown message type:', message.type);
            }
        } catch (error) {
            console.error('[WebSocket] Failed to parse message:', error);
        }
    }

    /**
     * Handle stream update message
     */
    handleStreamUpdate(message) {
        const { streamId, viewers } = message;

        // Update viewer count in DOM
        const viewerElement = document.querySelector(`[data-stream-id="${streamId}"] .stream-viewers-count`);
        if (viewerElement) {
            viewerElement.textContent = viewers;
        }
    }

    /**
     * Schedule reconnection attempt
     */
    scheduleReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.log('[WebSocket] Max reconnect attempts reached');
            return;
        }

        this.reconnectAttempts++;
        const delay = CONFIG.RECONNECT_DELAY * this.reconnectAttempts;

        console.log(`[WebSocket] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);

        setTimeout(() => {
            this.connect();
        }, delay);
    }

    /**
     * Fetch stream preview data
     */
    async fetchStreamPreview(streamId) {
        // In development, return mock data
        if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
            return this.getMockPreview(streamId);
        }

        try {
            const response = await fetch(`${CONFIG.API_URL}/stream/preview/${streamId}`);
            if (!response.ok) throw new Error('Failed to fetch');
            return await response.json();
        } catch (error) {
            console.error('[API] Failed to fetch stream preview:', error);
            return this.getMockPreview(streamId);
        }
    }

    /**
     * Get mock preview data
     */
    getMockPreview(streamId) {
        const stream = CONFIG.getStream(streamId);
        if (!stream) return null;

        return {
            id: stream.id,
            title: stream.title,
            status: 'live',
            viewers: CONFIG.randomizeViewers(stream.viewers),
            quality: '1080p',
            bitrate: '4500kbps',
            startedAt: new Date(Date.now() - Math.random() * 86400000).toISOString()
        };
    }

    /**
     * Disconnect from server
     */
    disconnect() {
        this.stopPing();
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        this.isConnected = false;
    }
}

// Create global instance
const wsClient = new HeartbeatClient();
