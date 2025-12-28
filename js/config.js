/**
 * Nature on Zoom — Configuration
 * Contains all stream data and API endpoints
 */

const CONFIG = {
  // API Endpoints
  WS_URL: 'wss://natureonzoom.win/ws/heartbeat',
  API_URL: 'https://natureonzoom.win/api',

  // For local development, use:
  // WS_URL: 'ws://localhost:8765/ws/heartbeat',
  // API_URL: 'http://localhost:8765/api',

  // WebSocket settings
  HEARTBEAT_INTERVAL: 30000, // 30 seconds
  RECONNECT_DELAY: 5000,      // 5 seconds

  // Stream data
  STREAMS: [
    {
      id: 'eagle',
      title: 'Bald Eagle Nest',
      description: 'Majestic bald eagle family nesting in the Alaskan wilderness. Watch the parents care for their eaglets in this stunning HD stream.',
      price: 5,
      status: 'live',
      viewers: 142,
      thumbnail: 'assets/images/eagle-thumb.jpg'
    },
    {
      id: 'owl',
      title: 'Barn Owl Family',
      description: 'A barn owl mother with her fluffy owlets in a rustic farmhouse attic. Night vision enabled for 24/7 viewing.',
      price: 3,
      status: 'live',
      viewers: 89,
      thumbnail: 'assets/images/owl-thumb.jpg'
    },
    {
      id: 'hummingbird',
      title: 'Hummingbird Haven',
      description: 'Tiny hummingbird nest no bigger than a walnut. Witness the miracle of these smallest birds raising their young.',
      price: 4,
      status: 'live',
      viewers: 234,
      thumbnail: 'assets/images/hummingbird-thumb.jpg'
    },
    {
      id: 'osprey',
      title: 'Osprey Overlook',
      description: 'Fish-hunting osprey overlooking a pristine mountain lake. Watch action-packed fishing dives and family interactions.',
      price: 4,
      status: 'live',
      viewers: 67,
      thumbnail: 'assets/images/osprey-thumb.jpg'
    },
    {
      id: 'falcon',
      title: 'Peregrine Falcon Tower',
      description: 'Urban peregrine falcons nesting on a downtown skyscraper. The fastest birds on Earth raise their chicks above the city.',
      price: 5,
      status: 'live',
      viewers: 178,
      thumbnail: 'assets/images/falcon-thumb.jpg'
    },
    {
      id: 'heron',
      title: 'Great Blue Heron Colony',
      description: 'Colonial nesting site with dozens of great blue herons. Stunning social interactions and dramatic feeding moments.',
      price: 2,
      status: 'live',
      viewers: 45,
      thumbnail: 'assets/images/heron-thumb.jpg'
    },
    {
      id: 'penguin',
      title: 'Penguin Nursery',
      description: 'Emperor penguins in Antarctica caring for their precious eggs and chicks. Experience the harsh beauty of the frozen continent.',
      price: 3,
      status: 'live',
      viewers: 312,
      thumbnail: 'assets/images/penguin-thumb.jpg'
    },
    {
      id: 'flamingo',
      title: 'Flamingo Lagoon',
      description: 'Pink flamingos wading in a tropical lagoon. Relaxing and mesmerizing — perfect for stress relief and meditation.',
      price: 1,
      status: 'live',
      viewers: 198,
      thumbnail: 'assets/images/flamingo-thumb.jpg'
    }
  ],

  /**
   * Get stream by ID
   * @param {string} id - Stream ID
   * @returns {Object|undefined} Stream object
   */
  getStream(id) {
    return this.STREAMS.find(stream => stream.id === id);
  },

  /**
   * Get random viewer count (for simulation)
   * @param {number} base - Base viewer count
   * @returns {number} Randomized viewer count
   */
  randomizeViewers(base) {
    const variance = Math.floor(base * 0.2); // ±20%
    return base + Math.floor(Math.random() * variance * 2) - variance;
  }
};

// Freeze config to prevent modifications
Object.freeze(CONFIG);
Object.freeze(CONFIG.STREAMS);
