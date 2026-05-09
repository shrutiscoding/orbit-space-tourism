document.addEventListener('DOMContentLoaded', () => {
    initStarfield();
    initScrollAnimations();
    initChat();
    initCart();
    updateActiveNavLink();
});

// Starfield Background
function initStarfield() {
    const starfield = document.createElement('div');
    starfield.id = 'starfield';
    document.body.prepend(starfield);

    for (let i = 0; i < 200; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        const size = Math.random() * 3 + 'px';
        star.style.width = size;
        star.style.height = size;
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.setProperty('--duration', Math.random() * 3 + 2 + 's');
        starfield.appendChild(star);
    }
}

// Scroll Animations (Intersection Observer)
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

// AI Concierge Chat
function initChat() {
    const fab = document.querySelector('.chat-fab');
    const window = document.querySelector('.chat-window');
    const closeBtn = document.querySelector('.chat-close');
    const input = document.querySelector('#chat-input');
    const sendBtn = document.querySelector('#chat-send');
    const messagesContainer = document.querySelector('.chat-messages');

    if (!fab) return;

    fab.addEventListener('click', () => {
        window.style.display = window.style.display === 'flex' ? 'none' : 'flex';
    });

    const sendMessage = async () => {
        const text = input.value.trim();
        if (!text) return;

        appendMessage('user', text);
        input.value = '';

        // Typing animation
        const typingId = appendMessage('bot', '...', true);

        try {
            const response = await fetch('/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text })
            });
            const data = await response.json();
            removeMessage(typingId);
            appendMessage('bot', data.reply);
        } catch (error) {
            removeMessage(typingId);
            appendMessage('bot', 'System offline. Please try again later.');
        }
    };

    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

    function appendMessage(sender, text, isTyping = false) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${sender}`;
        msgDiv.textContent = text;
        const id = 'msg-' + Date.now();
        msgDiv.id = id;
        messagesContainer.appendChild(msgDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        return id;
    }

    function removeMessage(id) {
        const el = document.getElementById(id);
        if (el) el.remove();
    }
}

// Booking Cart & Drawer
function initCart() {
    const cartBtn = document.querySelector('#cart-btn');
    const drawer = document.querySelector('.drawer-overlay');
    const closeDrawer = document.querySelector('.close-drawer');
    const cartItems = document.querySelector('.cart-items');
    
    if (cartBtn) {
        cartBtn.addEventListener('click', () => drawer.classList.add('active'));
    }
    
    if (closeDrawer) {
        closeDrawer.addEventListener('click', () => drawer.classList.remove('active'));
    }

    // Load items from localStorage
    renderCart();
}

function renderCart() {
    const items = JSON.parse(localStorage.getItem('orbit_cart') || '[]');
    const container = document.querySelector('.cart-items');
    if (!container) return;

    if (items.length === 0) {
        container.innerHTML = '<p style="text-align:center; color: var(--lunar-silver); margin-top: 2rem;">Your manifest is empty.</p>';
        return;
    }

    container.innerHTML = items.map((item, index) => `
        <div class="cart-item" style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 1rem; background: var(--glass-bg); padding: 1rem; border-radius: 10px;">
            <div>
                <h4 style="font-size: 1rem;">${item.name}</h4>
                <p style="color: var(--neon-cyan); font-size: 0.8rem;">${item.price}</p>
            </div>
            <button onclick="removeFromCart(${index})" style="background:transparent; border:none; color: #ff4444; cursor:pointer;">&times;</button>
        </div>
    `).join('');
}

window.addToCart = (id, name, price) => {
    const items = JSON.parse(localStorage.getItem('orbit_cart') || '[]');
    items.push({ id, name, price });
    localStorage.setItem('orbit_cart', JSON.stringify(items));
    renderCart();
    document.querySelector('.drawer-overlay').classList.add('active');
};

window.removeFromCart = (index) => {
    const items = JSON.parse(localStorage.getItem('orbit_cart') || '[]');
    items.splice(index, 1);
    localStorage.setItem('orbit_cart', JSON.stringify(items));
    renderCart();
};

window.checkout = async () => {
    const items = JSON.parse(localStorage.getItem('orbit_cart') || '[]');
    if (items.length === 0) return alert('Your manifest is empty!');

    const checkoutBtn = document.querySelector('.checkout-btn');
    checkoutBtn.textContent = 'Processing...';
    checkoutBtn.disabled = true;

    try {
        const response = await fetch('/reserve-trip', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                passenger_name: "Explorer",
                email: "explorer@orbit.com",
                destination_id: items[0].id || 1,
                package_type: "Luxury"
            })
        });
        const data = await response.json();
        alert(data.message + '! Reservation ID: ' + data.reservation_id);
        localStorage.removeItem('orbit_cart');
        renderCart();
        document.querySelector('.drawer-overlay').classList.remove('active');
    } catch (error) {
        alert('Communication error with Galactic Command.');
    } finally {
        checkoutBtn.textContent = 'Confirm Reservation';
        checkoutBtn.disabled = false;
    }
};

function updateActiveNavLink() {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a').forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('active');
        }
    });
}
