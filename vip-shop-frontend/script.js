const API_BASE_URL = 'http://localhost:3000';

const appState = {
    currentProduct: null,
    isLoading: false
};

// ==================== OPTIMIZED PARTICLE SYSTEM ====================

class ParticleSystem {
    constructor() {
        this.particles = [];
        this.mouseX = 0;
        this.mouseY = 0;
        this.canvas = document.getElementById('starfield');
        this.ctx = this.canvas.getContext('2d', { alpha: true });
        this.maxParticles = 50; // Limit particles
        this.lastTime = Date.now();
        
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        document.addEventListener('mousemove', (e) => this.onMouseMove(e));
        
        this.animate();
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    onMouseMove(e) {
        this.mouseX = e.clientX;
        this.mouseY = e.clientY;
        
        // Only create particles if we're under the limit
        if (this.particles.length < this.maxParticles) {
            for (let i = 0; i < 1; i++) {
                this.particles.push(new Particle(
                    this.mouseX + (Math.random() - 0.5) * 15,
                    this.mouseY + (Math.random() - 0.5) * 15
                ));
            }
        }
    }

    animate() {
        // Clear completely (no trails)
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Update and draw particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.update(this.mouseX, this.mouseY);
            p.draw(this.ctx);
            
            if (p.opacity <= 0) {
                this.particles.splice(i, 1);
            }
        }
        
        requestAnimationFrame(() => this.animate());
    }
}

class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = (Math.random() - 0.5) * 2 - 1;
        this.opacity = Math.random() * 0.6 + 0.2;
        this.size = Math.random() * 2 + 0.5;
        this.color = ['rgba(0, 212, 255', 'rgba(102, 51, 255', 'rgba(255, 0, 255'][Math.floor(Math.random() * 3)];
    }

    update(mouseX, mouseY) {
        this.vy += 0.08;
        
        const dx = mouseX - this.x;
        const dy = mouseY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 120) {
            const force = (120 - distance) / 120;
            this.vx += (dx / distance) * force * 0.2;
            this.vy += (dy / distance) * force * 0.2;
        }
        
        this.x += this.vx;
        this.y += this.vy;
        this.opacity -= 0.02;
        this.size *= 0.97;
    }

    draw(ctx) {
        ctx.fillStyle = `${this.color}, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

// ==================== BACKEND STATUS ====================

async function checkBackendStatus() {
    try {
        const response = await fetch(`${API_BASE_URL}/health`);
        if (response.ok) {
            document.getElementById('backendStatus').textContent = 'Online ✓';
        } else {
            setOfflineStatus();
        }
    } catch (error) {
        setOfflineStatus();
    }
}

function setOfflineStatus() {
    document.getElementById('backendStatus').textContent = 'Offline ✗';
}

// ==================== MODAL FUNCTIONS ====================

function openModal(button) {
    const card = button.closest('.product-card');
    const productName = card.querySelector('.product-name').textContent.trim();
    const priceAmount = card.querySelector('.product-price').textContent.trim();

    appState.currentProduct = {
        name: productName,
        price: priceAmount
    };

    document.getElementById('modalTitle').textContent = `Beitreten: ${productName}`;
    document.getElementById('messageBox').innerHTML = '';
    document.getElementById('buyForm').style.display = 'block';
    document.getElementById('buyForm').reset();
    document.getElementById('buyModal').classList.add('active');
}

function closeModal() {
    document.getElementById('buyModal').classList.remove('active');
    appState.currentProduct = null;
    appState.isLoading = false;
}

document.addEventListener('click', function(event) {
    const modal = document.getElementById('buyModal');
    if (event.target === modal) {
        closeModal();
    }
});

document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeModal();
    }
});

// ==================== FORM SUBMISSION ====================

if (document.getElementById('buyForm')) {
    document.getElementById('buyForm').addEventListener('submit', submitOrder);
}

async function submitOrder(event) {
    event.preventDefault();

    if (!appState.currentProduct) {
        showMessage('Fehler: Produkt nicht gefunden', 'error');
        return;
    }

    const paymentMethod = document.getElementById('paymentMethod').value;
    const code = document.getElementById('codeInput').value.trim();
    const telegramUsername = document.getElementById('telegramUsername').value.trim();

    if (!paymentMethod) {
        showMessage('Bitte wähle eine Zahlungsmethode', 'error');
        return;
    }

    if (!code) {
        showMessage('Bitte gib einen Code ein', 'error');
        return;
    }

    if (code.length < 5) {
        showMessage('Der Code ist zu kurz', 'error');
        return;
    }

    if (!telegramUsername) {
        showMessage('Bitte gib deinen Telegram @ ein', 'error');
        return;
    }

    let normalizedUsername = telegramUsername;
    if (!normalizedUsername.startsWith('@')) {
        normalizedUsername = '@' + normalizedUsername;
    }

    setFormLoading(true);

    try {
        const response = await fetch(`${API_BASE_URL}/order`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                product_name: appState.currentProduct.name,
                payment_method: paymentMethod,
                code: code,
                telegram_username: normalizedUsername
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Fehler beim Erstellen der Bestellung');
        }

        showSuccessMessage(data.order_id, normalizedUsername);
        setFormLoading(false);

    } catch (error) {
        console.error('Error:', error);
        showMessage(error.message || 'Fehler beim Erstellen der Bestellung', 'error');
        setFormLoading(false);
    }
}

// ==================== UI FUNCTIONS ====================

function setFormLoading(loading) {
    appState.isLoading = loading;
    const btn = document.querySelector('#buyForm button');
    
    if (loading) {
        btn.disabled = true;
        btn.innerHTML = '<span class="btn-loading"></span> Verarbeite...';
    } else {
        btn.disabled = false;
        btn.innerHTML = '✓ Bestätigen & Beitreten';
    }
}

function showMessage(message, type) {
    const messageBox = document.getElementById('messageBox');
    messageBox.innerHTML = `<div class="message ${type}">${message}</div>`;
}

function showSuccessMessage(orderId, telegramUsername) {
    const messageBox = document.getElementById('messageBox');
    const form = document.getElementById('buyForm');

    form.style.display = 'none';

    messageBox.innerHTML = `
        <div class="success-message">
            <span class="emoji">✨</span>
            <div style="font-size: 20px; margin-bottom: 15px; color: #00d4ff;">
                <strong>Bestellung erfolgreich!</strong>
            </div>
            
            <div class="order-details">
                <p><strong>Bestellungs-ID:</strong></p>
                <p class="order-id">${orderId}</p>
                
                <p style="margin-top: 15px;"><strong>Telegram:</strong></p>
                <p>${telegramUsername}</p>
                
                <p style="margin-top: 15px; color: #888;">
                    🎯 Wir schreiben dir in Kürze! Überprüfe deine Telegram-Anfragen.
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
    closeModal();
}

// ==================== PAYMENT METHOD CHANGE ====================

document.addEventListener('DOMContentLoaded', function() {
    const paymentMethodSelect = document.getElementById('paymentMethod');
    const codeInput = document.getElementById('codeInput');
    const codePlaceholderHint = document.getElementById('codePlaceholderHint');

    if (paymentMethodSelect) {
        paymentMethodSelect.addEventListener('change', function() {
            if (this.value === 'paysafecard') {
                codeInput.placeholder = 'z.B. 1234-5678-9012-3456';
                codePlaceholderHint.textContent = 'Gib deinen Paysafecard-Code ein';
            } else if (this.value === 'cryptovoucher') {
                codeInput.placeholder = 'z.B. M8L47P5396JFNG6BLM5698ZNZD0G7NXV';
                codePlaceholderHint.textContent = 'Gib deinen Cryptovoucher-Code ein';
            }
        });
    }
});

// ==================== INITIALIZATION ====================

document.addEventListener('DOMContentLoaded', function() {
    // Starte Particle System
    new ParticleSystem();
    
    checkBackendStatus();
    setInterval(checkBackendStatus, 30000);
});
