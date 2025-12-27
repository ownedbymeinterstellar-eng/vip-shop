const API_BASE_URL =
    (window.location.hostname === 'localhost') ? 'http://localhost:3000' : 'https://api.vipshop.cloud';

const RECAPTCHA_SITE_KEY = '6LcspTgsAAAAALKJxXU1QPKKYqGxi_KHObsxVlvO';

const appState = {
    currentProduct: null,
    isLoading: false
};

// ==================== PRODUCT SELECTION ====================

function selectProduct(productName, price) {
    appState.currentProduct = { name: productName, price: price };
    document.getElementById('productName').value = productName;
    
    // Smooth scroll to form
    document.querySelector('.buy-section').scrollIntoView({ behavior: 'smooth' });
}

// ==================== FORM HANDLING ====================

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('buyForm');
    if (form) {
        form.addEventListener('submit', submitOrder);
    }

    // Payment method change handler
    const paymentMethod = document.getElementById('paymentMethod');
    const codeInput = document.getElementById('code');
    
    if (paymentMethod) {
        paymentMethod.addEventListener('change', function() {
            if (this.value === 'paysafecard') {
                codeInput.placeholder = 'z.B. 1234-5678-9012-3456';
            } else if (this.value === 'cryptovoucher') {
                codeInput.placeholder = 'z.B. M8L47P5396JFNG6BLM5698ZNZD0G7NXV';
            } else if (this.value === 'paypal') {
                codeInput.placeholder = 'z.B. PayPal-Transaktions-ID';
            }
        });
    }
});

// ==================== SUBMIT ORDER ====================

async function submitOrder(e) {
    e.preventDefault();

    const productName = document.getElementById('productName').value;
    const paymentMethod = document.getElementById('paymentMethod').value;
    const code1 = document.getElementById('code1').value.trim();
    const code2 = document.getElementById('code2').value.trim();
    const customerEmail = document.getElementById('customerEmail').value.trim();

    // Validierung
    if (!productName) {
        showToast('Bitte wähle ein VIP-Level aus', 'error');
        return;
    }

    if (!paymentMethod || paymentMethod === '') {
        showToast('Bitte wähle eine Zahlungsmethode', 'error');
        return;
    }

    if (!code1) {
        showToast('Bitte gib mindestens Code 1 ein', 'error');
        return;
    }

    if (code1.length < 5) {
        showToast('Code 1 ist zu kurz', 'error');
        return;
    }

    if (code2 && code2.length < 5) {
        showToast('Code 2 ist zu kurz', 'error');
        return;
    }

    if (!customerEmail) {
        showToast('Bitte gib deine E-Mail ein', 'error');
        return;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail)) {
        showToast('Bitte gib eine gültige E-Mail ein', 'error');
        return;
    }

    // Generate reCAPTCHA token FIRST
    let recaptchaToken = 'test-token-localhost'; // Default für localhost
    
    // Nur auf Production reCAPTCHA verwenden
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        // Check if reCAPTCHA is loaded
        if (typeof grecaptcha === 'undefined') {
            console.error('reCAPTCHA not loaded');
            showToast('Sicherheitssystem wird noch geladen. Bitte warte kurz und versuche erneut.', 'error');
            return;
        }

        try {
            console.log('Generating reCAPTCHA token...');
            recaptchaToken = await grecaptcha.execute(RECAPTCHA_SITE_KEY, { action: 'submitOrder' });
            console.log('reCAPTCHA token generated successfully');
        } catch (error) {
            console.error('reCAPTCHA error:', error);
            showToast('Sicherheitsüberprüfung fehlgeschlagen: ' + error.message, 'error');
            return;
        }
    } else {
        console.log('Localhost detected - using test token for reCAPTCHA');
    }
    
    try {
        
        // Then show confirmation modal with the token
        showConfirmationModal(productName, paymentMethod, customerEmail, recaptchaToken, () => {
            // User confirmed - proceed with order
            proceedWithOrder(productName, paymentMethod, code1, code2, customerEmail, recaptchaToken);
        });
    } catch (error) {
        console.error('reCAPTCHA error:', error);
        showToast('Sicherheitsüberprüfung fehlgeschlagen: ' + error.message, 'error');
    }
}

// Proceed with order submission
async function proceedWithOrder(productName, paymentMethod, code1, code2, customerEmail, recaptchaToken) {
    setFormLoading(true);

    try {
        // Combine codes - if code2 exists, combine them with |, otherwise just use code1
        const finalCode = code2 ? code1 + '|' + code2 : code1;

        const response = await fetch(`${API_BASE_URL}/order`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                product_name: productName,
                payment_method: paymentMethod,
                code: finalCode,
                telegram_username: customerEmail,
                customer_email: customerEmail,
                recaptcha_token: recaptchaToken
            })
        });

        const data = await response.json();

        if (!response.ok) {
            setFormLoading(false);
            throw new Error(data.error || 'Fehler beim Erstellen der Bestellung');
        }

        // Success - show success message before resetting form loading state
        showSuccessMessage(data.order_id, customerEmail);
        // Don't call setFormLoading(false) here as the form is already hidden

    } catch (error) {
        console.error('Error:', error);
        showToast(error.message || 'Fehler beim Erstellen der Bestellung', 'error');
        setFormLoading(false);
    }
}

// ==================== UI FUNCTIONS ====================

function setFormLoading(loading) {
    appState.isLoading = loading;
    const btn = document.querySelector('#buyForm button');
    
    if (loading) {
        btn.disabled = true;
        btn.textContent = '⏳ Verarbeite...';
    } else {
        btn.disabled = false;
        btn.textContent = '✓ Bestätigen & Beitreten';
    }
}

function showSuccessMessage(orderId, customerEmail) {
    const messageBox = document.getElementById('messageBox');
    const form = document.getElementById('buyForm');

    // Hide form and show success message
    form.style.display = 'none';
    messageBox.style.display = 'block';

    messageBox.innerHTML = `
        <div class="success-message">
            <span class="emoji">✨</span>
            <div style="font-size: 20px; margin-bottom: 15px; color: var(--gold-light);">
                <strong>Bestellung wurde freigegeben!</strong>
            </div>
            
            <div class="order-details">
                <p><strong>Bestellungs-ID:</strong></p>
                <p class="order-id">${orderId}</p>
                
                <p style="margin-top: 15px;"><strong>E-Mail:</strong></p>
                <p style="color: var(--text-secondary);">${customerEmail}</p>
                
                <p style="margin-top: 20px; color: var(--text-secondary);">
                    📧 Schau in deine Email rein und warte auf weitere Details.
                </p>
                <p style="color: var(--text-tertiary); font-size: 13px; margin-top: 10px;">
                    Du erhältst den Einladungslink zur Telegram-Gruppe nach Genehmigung durch unser Team.
                </p>
            </div>
        </div>

        <button class="btn" onclick="backToShop()" style="margin-top: 20px;">
            Zurück zum Shop
        </button>
    `;

    // Scroll to success message
    setTimeout(() => {
        messageBox.scrollIntoView({ behavior: 'smooth' });
    }, 100);
}

function backToShop() {
    const form = document.getElementById('buyForm');
    const messageBox = document.getElementById('messageBox');
    
    form.style.display = 'block';
    messageBox.style.display = 'none';
    messageBox.innerHTML = '';
    form.reset();
    document.getElementById('productName').value = '';
    
    // Reset button state
    const btn = form.querySelector('button');
    if (btn) {
        btn.disabled = false;
        btn.textContent = 'Bestätigen & Beitreten';
    }
    
    // Scroll to form
    form.scrollIntoView({ behavior: 'smooth' });
}

// ==================== TOAST NOTIFICATIONS ====================

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ==================== MODAL HANDLING ====================

// Prevent accidental close when clicking outside modal
document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('modal');
    if (modal) {
        // Prevent closing when clicking on modal content
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                // Only close if clicking outside (on backdrop)
                // Intentionally don't close for UX
            }
        });

        // Close button handler
        const closeBtn = document.querySelector('.close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', function() {
                modal.classList.remove('active');
            });
        }
    }
});

// ==================== CURSOR TRACKING & PARTICLES ====================

class CursorTracker {
    constructor() {
        this.mouseX = 0;
        this.mouseY = 0;
        this.cursorElement = null;
        this.particles = [];
        
        this.init();
    }

    init() {
        // Create cursor element
        this.cursorElement = document.createElement('div');
        this.cursorElement.id = 'cursor';
        document.body.appendChild(this.cursorElement);

        // Track mouse movement
        document.addEventListener('mousemove', (e) => this.onMouseMove(e));
        document.addEventListener('mouseleave', () => this.onMouseLeave());
        document.addEventListener('mouseenter', () => this.onMouseEnter());
    }

    onMouseMove(e) {
        this.mouseX = e.clientX;
        this.mouseY = e.clientY;

        // Update cursor position
        if (this.cursorElement) {
            this.cursorElement.style.left = this.mouseX + 'px';
            this.cursorElement.style.top = this.mouseY + 'px';
        }

        // Create particles
        if (Math.random() > 0.7) {
            this.createParticle(this.mouseX, this.mouseY);
        }

        // Update product card glow effect
        document.querySelectorAll('.product-card').forEach(card => {
            const rect = card.getBoundingClientRect();
            const x = ((this.mouseX - rect.left) / rect.width) * 100;
            const y = ((this.mouseY - rect.top) / rect.height) * 100;
            card.style.setProperty('--mouse-x', x + '%');
            card.style.setProperty('--mouse-y', y + '%');
        });
    }

    onMouseLeave() {
        if (this.cursorElement) {
            this.cursorElement.style.opacity = '0';
        }
    }

    onMouseEnter() {
        if (this.cursorElement) {
            this.cursorElement.style.opacity = '1';
        }
    }

    createParticle(x, y) {
        const particle = document.createElement('div');
        particle.className = 'particle particle-dot';
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        document.body.appendChild(particle);

        let opacity = 1;
        let scale = 1;
        let vx = (Math.random() - 0.5) * 4;
        let vy = (Math.random() - 0.5) * 4 - 1;

        const animate = () => {
            opacity -= 0.02;
            scale += 0.02;
            x += vx;
            y += vy;

            particle.style.opacity = opacity;
            particle.style.left = x + 'px';
            particle.style.top = y + 'px';
            particle.style.transform = `scale(${scale})`;

            if (opacity > 0) {
                requestAnimationFrame(animate);
            } else {
                particle.remove();
            }
        };

        animate();
    }
}

// ==================== CONFIRMATION MODAL ====================

function showConfirmationModal(productName, paymentMethod, email, recaptchaToken, onConfirm) {
    const modal = document.getElementById('confirmationModal');
    
    // Fill in the modal details
    document.getElementById('confirmProduct').textContent = productName;
    document.getElementById('confirmPayment').textContent = paymentMethod;
    document.getElementById('confirmEmail').textContent = email;
    
    // Show modal
    modal.classList.add('active');
    
    // Set up button handlers
    const confirmBtn = document.getElementById('confirmYes');
    const cancelBtn = document.getElementById('confirmNo');
    
    const handleConfirm = () => {
        modal.classList.remove('active');
        confirmBtn.removeEventListener('click', handleConfirm);
        cancelBtn.removeEventListener('click', handleCancel);
        document.removeEventListener('keydown', handleEscape);
        onConfirm();
    };
    
    const handleCancel = () => {
        modal.classList.remove('active');
        confirmBtn.removeEventListener('click', handleConfirm);
        cancelBtn.removeEventListener('click', handleCancel);
        document.removeEventListener('keydown', handleEscape);
    };
    
    confirmBtn.addEventListener('click', handleConfirm);
    cancelBtn.addEventListener('click', handleCancel);
    
    // Close on escape key
    const handleEscape = (e) => {
        if (e.key === 'Escape') {
            handleCancel();
        }
    };
    
    document.addEventListener('keydown', handleEscape);
}

// ==================== INITIALIZATION ====================

document.addEventListener('DOMContentLoaded', function() {
    console.log('VIP Shop loaded successfully');
    
    // Initialize cursor tracker
    new CursorTracker();
});
