const API_BASE_URL =
    (window.location.hostname === 'localhost') ? 'http://localhost:3000' : 'https://api.vipshop.cloud';

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
    const code = document.getElementById('code').value.trim();
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

    if (!code) {
        showToast('Bitte gib einen Code ein', 'error');
        return;
    }

    if (code.length < 5) {
        showToast('Der Code ist zu kurz', 'error');
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

    setFormLoading(true);

    try {
        const response = await fetch(`${API_BASE_URL}/order`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                product_name: productName,
                payment_method: paymentMethod,
                code: code,
                telegram_username: customerEmail,
                customer_email: customerEmail
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Fehler beim Erstellen der Bestellung');
        }

        showSuccessMessage(data.order_id, customerEmail);
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

function showSuccessMessage(orderId, customerEmail) {
    const messageBox = document.getElementById('messageBox');
    const form = document.getElementById('buyForm');

    form.style.display = 'none';

    messageBox.innerHTML = `
        <div class="success-message">
            <span class="emoji">✨</span>
            <div style="font-size: 20px; margin-bottom: 15px; color: var(--gold-light);">
                <strong>Bestellung erfolgreich!</strong>
            </div>
            
            <div class="order-details">
                <p><strong>Bestellungs-ID:</strong></p>
                <p class="order-id">${orderId}</p>
                
                <p style="margin-top: 15px;"><strong>E-Mail:</strong></p>
                <p style="color: var(--text-secondary);">${customerEmail}</p>
                
                <p style="margin-top: 20px; color: var(--text-secondary);">
                    📧 Wir schreiben dir in Kürze! Überprüfe dein E-Mail-Postfach.
                </p>
                <p style="color: var(--text-tertiary); font-size: 13px; margin-top: 10px;">
                    (Schau auch in deinem Spam-Ordner nach)
                </p>
            </div>
        </div>

        <button class="btn" onclick="backToShop()" style="margin-top: 20px;">
            ← Zurück zum Shop
        </button>
    `;

    messageBox.scrollIntoView({ behavior: 'smooth' });
}

function backToShop() {
    document.getElementById('buyForm').style.display = 'block';
    document.getElementById('buyForm').reset();
    document.getElementById('messageBox').innerHTML = '';
    document.getElementById('productName').value = '';
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

// ==================== INITIALIZATION ====================

document.addEventListener('DOMContentLoaded', function() {
    console.log('VIP Shop loaded successfully');
});
