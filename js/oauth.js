/**
 * Nature on Zoom — OAuth Module
 * Handles authentication modal and flow
 */

const OAuth = {
    modal: null,
    form: null,
    closeBtn: null,
    currentStreamId: null,

    /**
     * Initialize OAuth module
     */
    init() {
        this.modal = document.getElementById('oauth-modal');
        this.form = document.getElementById('oauth-form');
        this.closeBtn = document.getElementById('modal-close');

        if (!this.modal || !this.form) {
            console.warn('[OAuth] Modal elements not found');
            return;
        }

        this.bindEvents();
    },

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Close button
        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => this.hide());
        }

        // Click outside modal
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.hide();
            }
        });

        // Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.classList.contains('active')) {
                this.hide();
            }
        });

        // Form submit
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });
    },

    /**
     * Show OAuth modal
     * @param {string} streamId - ID of the stream user wants to watch
     */
    show(streamId) {
        this.currentStreamId = streamId;

        // Store stream ID for payment page
        sessionStorage.setItem('selectedStreamId', streamId);

        // Show modal with animation
        this.modal.classList.add('active');

        // Focus email input
        const emailInput = document.getElementById('oauth-email');
        if (emailInput) {
            setTimeout(() => emailInput.focus(), 300);
        }

        // Prevent body scroll
        document.body.style.overflow = 'hidden';

        console.log(`[OAuth] Modal opened for stream: ${streamId}`);
    },

    /**
     * Hide OAuth modal
     */
    hide() {
        this.modal.classList.remove('active');
        this.currentStreamId = null;

        // Restore body scroll
        document.body.style.overflow = '';

        // Reset form
        this.form.reset();
    },

    /**
     * Handle form submission (simulated OAuth)
     */
    handleSubmit() {
        const email = document.getElementById('oauth-email').value;

        // Simulate authentication delay
        const submitBtn = this.form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;

        submitBtn.disabled = true;
        submitBtn.innerHTML = `
      <svg class="animate-spin" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10" stroke-opacity="0.25"/>
        <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"/>
      </svg>
      Signing in...
    `;

        // Simulate API delay
        setTimeout(() => {
            console.log(`[OAuth] Authenticated as: ${email || 'anonymous'}`);

            // Store auth state
            sessionStorage.setItem('isAuthenticated', 'true');
            sessionStorage.setItem('userEmail', email || 'user@example.com');

            // Redirect to payment page
            const stream = CONFIG.getStream(this.currentStreamId);
            const price = stream ? stream.price : 5;

            window.location.href = `charge.html?stream=${this.currentStreamId}&price=${price}`;
        }, 1500);
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    OAuth.init();
});
