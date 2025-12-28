/**
 * Nature on Zoom — Main Application
 * Initializes the app and renders stream cards
 */

const App = {
  /**
   * Initialize application
   */
  init() {
    console.log('[App] Initializing Nature on Zoom...');

    // Render streams
    this.renderStreams();

    // Initialize WebSocket connection
    wsClient.connect();

    // Setup hover effects for stream previews
    this.setupStreamHovers();

    console.log('[App] Initialization complete');
  },

  /**
   * Render stream cards
   */
  renderStreams() {
    const container = document.getElementById('streams-list');
    if (!container) {
      console.warn('[App] Streams container not found');
      return;
    }

    const html = CONFIG.STREAMS.map((stream, index) => this.createStreamCard(stream, index)).join('');
    container.innerHTML = html;

    // Bind play button events
    this.bindPlayButtons();
  },

  /**
   * Create HTML for a stream card
   */
  createStreamCard(stream, index) {
    const gradients = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      'linear-gradient(135deg, #5ee7df 0%, #b490ca 100%)',
      'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)'
    ];

    const gradient = gradients[index % gradients.length];

    return `
      <article class="stream-card stagger-${index + 1}" data-stream-id="${stream.id}">
        <div class="stream-preview" style="background: ${gradient}">
          ${stream.thumbnail ? `<img src="${stream.thumbnail}" alt="${stream.title}" class="stream-thumbnail" loading="lazy" onerror="this.style.display='none'">` : ''}
          <!-- Live Badge -->
          <div class="stream-live-badge">
            <span class="stream-live-dot"></span>
            LIVE
          </div>
          
          <!-- Viewers -->
          <div class="stream-viewers">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            <span class="stream-viewers-count">${stream.viewers}</span>
          </div>
          
          <!-- Play Button -->
          <button class="stream-play-btn" data-stream-id="${stream.id}" aria-label="Play ${stream.title}">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
          </button>
        </div>
        
        <div class="stream-content">
          <h3 class="stream-title">${stream.title}</h3>
          <p class="stream-description">${stream.description}</p>
          <div class="stream-footer">
            <div class="stream-price">
              <span class="stream-price-value">$${stream.price}</span>
              <span class="stream-price-period">/hour</span>
            </div>
            <button class="btn btn-primary" data-stream-id="${stream.id}">
              Watch Now
            </button>
          </div>
        </div>
      </article>
    `;
  },

  /**
   * Bind click events to play buttons
   */
  bindPlayButtons() {
    // Play buttons (circular)
    document.querySelectorAll('.stream-play-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const streamId = btn.dataset.streamId;
        this.handlePlayClick(streamId);
      });
    });

    // "Watch Now" buttons
    document.querySelectorAll('.stream-footer .btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const streamId = btn.dataset.streamId;
        this.handlePlayClick(streamId);
      });
    });
  },

  /**
   * Handle play button click
   */
  handlePlayClick(streamId) {
    console.log(`[App] Play clicked for stream: ${streamId}`);

    // Show OAuth modal
    if (typeof OAuth !== 'undefined') {
      OAuth.show(streamId);
    } else {
      // Fallback: direct redirect
      window.location.href = `charge.html?stream=${streamId}`;
    }
  },

  /**
   * Setup hover effects for stream cards
   */
  setupStreamHovers() {
    document.querySelectorAll('.stream-card').forEach(card => {
      card.addEventListener('mouseenter', async () => {
        const streamId = card.dataset.streamId;

        // Fetch fresh stream data
        const preview = await wsClient.fetchStreamPreview(streamId);
        if (preview) {
          // Update viewers count
          const viewersEl = card.querySelector('.stream-viewers-count');
          if (viewersEl) {
            viewersEl.textContent = preview.viewers;
          }
        }
      });
    });
  }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  wsClient.disconnect();
});
