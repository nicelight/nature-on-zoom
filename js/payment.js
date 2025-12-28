/**
 * Nature on Zoom — Payment Module
 * Handles payment form validation and submission
 */

const Payment = {
    form: null,
    streamId: null,
    price: 5,

    /**
     * Initialize payment module
     */
    init() {
        this.form = document.getElementById('payment-form');

        if (!this.form) {
            console.warn('[Payment] Form not found');
            return;
        }

        // Get stream info from URL
        this.parseUrlParams();

        // Update UI with stream info
        this.updateStreamInfo();

        // Setup form validation and formatting
        this.setupCardFormatting();
        this.setupFormValidation();

        console.log('[Payment] Initialized for stream:', this.streamId);
    },

    /**
     * Parse URL parameters
     */
    parseUrlParams() {
        const params = new URLSearchParams(window.location.search);
        this.streamId = params.get('stream') || sessionStorage.getItem('selectedStreamId') || 'eagle';
        this.price = parseInt(params.get('price')) || 5;
    },

    /**
     * Update stream info in UI
     */
    updateStreamInfo() {
        const stream = CONFIG.getStream(this.streamId);

        if (stream) {
            // Update title
            const titleEl = document.getElementById('stream-title');
            if (titleEl) titleEl.textContent = stream.title;

            // Update price display
            const priceEls = document.querySelectorAll('.charge-amount-value');
            priceEls.forEach(el => el.textContent = `$${stream.price}`);

            // Update pay button
            const payBtn = document.getElementById('pay-btn');
            if (payBtn) {
                payBtn.innerHTML = `
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          Pay $${stream.price}.00 Now
        `;
            }

            this.price = stream.price;
        }
    },

    /**
     * Setup card number formatting
     */
    setupCardFormatting() {
        const cardNumber = document.getElementById('card-number');
        const cardExpiry = document.getElementById('card-expiry');
        const cardCvv = document.getElementById('card-cvv');
        const cardHolder = document.getElementById('card-holder');

        // Card number formatting (XXXX XXXX XXXX XXXX)
        if (cardNumber) {
            cardNumber.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');
                value = value.substring(0, 16);
                value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
                e.target.value = value;

                // Update preview
                const preview = document.getElementById('card-preview');
                if (preview) {
                    preview.textContent = value || '•••• •••• •••• ••••';
                }
            });
        }

        // Expiry date formatting (MM/YY)
        if (cardExpiry) {
            cardExpiry.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');
                value = value.substring(0, 4);
                if (value.length >= 2) {
                    value = value.substring(0, 2) + '/' + value.substring(2);
                }
                e.target.value = value;

                // Update preview
                const preview = document.getElementById('card-expiry-preview');
                if (preview) {
                    preview.textContent = value || 'MM/YY';
                }
            });
        }

        // CVV - numbers only
        if (cardCvv) {
            cardCvv.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/\D/g, '').substring(0, 3);
            });
        }

        // Cardholder name - update preview
        if (cardHolder) {
            cardHolder.addEventListener('input', (e) => {
                const preview = document.getElementById('card-holder-preview');
                if (preview) {
                    preview.textContent = e.target.value.toUpperCase() || 'CARDHOLDER NAME';
                }
            });
        }
    },

    /**
     * Setup form validation and submission
     */
    setupFormValidation() {
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();

            if (this.validateForm()) {
                this.handleSubmit();
            }
        });
    },

    /**
     * Validate form fields
     */
    validateForm() {
        const cardNumber = document.getElementById('card-number').value.replace(/\s/g, '');
        const cardExpiry = document.getElementById('card-expiry').value;
        const cardCvv = document.getElementById('card-cvv').value;
        const cardHolder = document.getElementById('card-holder').value;

        // Simple validation
        if (cardNumber.length < 13) {
            this.showError('Please enter a valid card number');
            return false;
        }

        if (!cardExpiry.match(/^\d{2}\/\d{2}$/)) {
            this.showError('Please enter a valid expiry date (MM/YY)');
            return false;
        }

        if (cardCvv.length !== 3) {
            this.showError('Please enter a valid CVV');
            return false;
        }

        if (cardHolder.length < 2) {
            this.showError('Please enter the cardholder name');
            return false;
        }

        return true;
    },

    /**
     * Show validation error
     */
    showError(message) {
        // Simple alert for now, could be replaced with toast
        alert(message);
    },

    /**
     * Handle form submission (simulated payment)
     */
    handleSubmit() {
        const payBtn = document.getElementById('pay-btn');
        const originalHtml = payBtn.innerHTML;

        // Show loading state
        payBtn.disabled = true;
        payBtn.innerHTML = `
      <svg class="animate-spin" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10" stroke-opacity="0.25"/>
        <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"/>
      </svg>
      Processing...
    `;

        // Simulate payment processing
        setTimeout(() => {
            console.log('[Payment] Payment processed successfully');

            // Clear session storage
            sessionStorage.removeItem('selectedStreamId');
            sessionStorage.removeItem('isAuthenticated');

            // Redirect to main page
            window.location.href = 'index.html';
        }, 2000);
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    Payment.init();
});
