// API URL (ajuste conforme necessário)
const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000/api' 
    : '/api';

// Carrinho de compras
let cart = JSON.parse(localStorage.getItem('cart') || '[]');

// Atualizar contador do carrinho
function updateCartCount() {
    const cartCount = document.getElementById('cartCount');
    if (cartCount) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
    }
}

// Adicionar ao carrinho
function addToCart(product, quantity = 1) {
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: quantity
        });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    showMessage('Produto adicionado ao carrinho!', 'success');
}

// Remover do carrinho
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    if (window.location.pathname.includes('cart.html')) {
        loadCartPage();
    }
}

// Atualizar quantidade
function updateQuantity(productId, newQuantity) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        if (newQuantity <= 0) {
            removeFromCart(productId);
        } else {
            item.quantity = newQuantity;
            localStorage.setItem('cart', JSON.stringify(cart));
            if (window.location.pathname.includes('cart.html')) {
                loadCartPage();
            }
        }
    }
}

// Calcular total do carrinho
function calculateTotal() {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

// Mostrar mensagem
function showMessage(message, type) {
    const messageDiv = document.getElementById('messageResult') || 
                       document.getElementById('contactMessageResult');
    
    if (messageDiv) {
        messageDiv.textContent = message;
        messageDiv.className = `message-result ${type}`;
        
        setTimeout(() => {
            messageDiv.textContent = '';
            messageDiv.className = 'message-result';
        }, 3000);
    } else {
        alert(message);
    }
}

// Carregar produtos
async function loadProducts(category = 'todos', search = '') {
    try {
        let url = `${API_URL}/products`;
        const params = new URLSearchParams();
        
        if (category && category !== 'todos') params.append('category', category);
        if (search) params.append('search', search);
        
        if (params.toString()) {
            url += `?${params.toString()}`;
        }
        
        const response = await fetch(url);
        const data = await response.json();
        
        return data.products || [];
    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
        return [];
    }
}

// Renderizar produtos
async function renderProducts() {
    const productsGrid = document.getElementById('productsGrid');
    if (!productsGrid) return;
    
    const category = document.getElementById('categoryFilter')?.value || 'todos';
    const search = document.getElementById('searchInput')?.value || '';
    
    const products = await loadProducts(category, search);
    
    if (products.length === 0) {
        productsGrid.innerHTML = '<p style="text-align: center; grid-column: 1/-1;">Nenhum produto encontrado</p>';
        return;
    }
    
    productsGrid.innerHTML = products.map(product => `
        <div class="product-card">
            <img src="${product.image}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/400x200?text=Produto'">
            <div class="product-info">
                <h3>${product.name}</h3>
                <div class="product-price">R$ ${product.price.toFixed(2)}</div>
                <p class="product-description">${product.description.substring(0, 100)}...</p>
                <button class="btn-add-to-cart" onclick="addToCart(${JSON.stringify(product).replace(/"/g, '&quot;')})">
                    Adicionar ao Carrinho
                </button>
            </div>
        </div>
    `).join('');
}

// Carregar página do carrinho
function loadCartPage() {
    const cartItemsDiv = document.getElementById('cartItems');
    if (!cartItemsDiv) return;
    
    if (cart.length === 0) {
        cartItemsDiv.innerHTML = '<p style="text-align: center;">Seu carrinho está vazio</p>';
        document.getElementById('cartSummary').innerHTML = '';
        return;
    }
    
    cartItemsDiv.innerHTML = cart.map(item => `
        <div class="cart-item">
            <img src="${item.image}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/80x80?text=Produto'">
            <div>
                <h3>${item.name}</h3>
                <p>R$ ${item.price.toFixed(2)}</p>
            </div>
            <div>
                <input type="number" value="${item.quantity}" min="1" 
                       onchange="updateQuantity(${item.id}, this.value)" style="width: 60px;">
            </div>
            <button onclick="removeFromCart(${item.id})" class="btn-primary" style="background: #dc3545;">Remover</button>
        </div>
    `).join('');
    
    const total = calculateTotal();
    const cartSummary = document.getElementById('cartSummary');
    cartSummary.innerHTML = `
        <h3>Resumo do Pedido</h3>
        <p>Subtotal: R$ ${total.toFixed(2)}</p>
        <p>Frete: R$ 0,00</p>
        <hr>
        <h4>Total: R$ ${total.toFixed(2)}</h4>
        <a href="checkout.html" class="btn-primary" style="display: inline-block; margin-top: 1rem;">Finalizar Compra</a>
    `;
}

// Carregar página de checkout
function loadCheckoutPage() {
    const orderSummary = document.getElementById('orderSummary');
    if (!orderSummary) return;
    
    const total = calculateTotal();
    const paymentMethod = document.querySelector('input[name="payment"]:checked')?.value || 'pix';
    let finalTotal = total;
    
    if (paymentMethod === 'pix') {
        finalTotal = total * 0.9; // 10% off
    }
    
    orderSummary.innerHTML = `
        <h3>Resumo do Pedido</h3>
        ${cart.map(item => `
            <div style="display: flex; justify-content: space-between; margin: 10px 0;">
                <span>${item.name} x ${item.quantity}</span>
                <span>R$ ${(item.price * item.quantity).toFixed(2)}</span>
            </div>
        `).join('')}
        <hr>
        <div style="display: flex; justify-content: space-between;">
            <strong>Total:</strong>
            <strong>R$ ${finalTotal.toFixed(2)}</strong>
        </div>
        ${paymentMethod === 'pix' ? '<p style="color: green;">✓ 10% de desconto aplicado!</p>' : ''}
    `;
}

// Finalizar compra
async function finalizeOrder(event) {
    event.preventDefault();
    
    const orderData = {
        customer: {
            name: document.getElementById('name')?.value,
            email: document.getElementById('email')?.value,
            phone: document.getElementById('phone')?.value,
            address: {
                cep: document.getElementById('cep')?.value,
                street: document.getElementById('address')?.value,
                number: document.getElementById('number')?.value,
                complement: document.getElementById('complement')?.value,
                city: document.getElementById('city')?.value
            }
        },
        items: cart.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity
        })),
        total: calculateTotal(),
        paymentMethod: document.querySelector('input[name="payment"]:checked')?.value
    };
    
    try {
        const response = await fetch(`${API_URL}/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            localStorage.removeItem('cart');
            cart = [];
            updateCartCount();
            showMessage('Pedido realizado com sucesso!', 'success');
            setTimeout(() => {
                window.location.href = 'products.html';
            }, 2000);
        } else {
            showMessage(data.error || 'Erro ao realizar pedido', 'error');
        }
    } catch (error) {
        console.error('Erro:', error);
        showMessage('Erro ao processar pedido', 'error');
    }
}

// Enviar mensagem de contato
async function sendContactMessage(event) {
    event.preventDefault();
    
    const data = {
        name: document.getElementById('contactName')?.value,
        email: document.getElementById('contactEmail')?.value,
        subject: document.getElementById('contactSubject')?.value,
        message: document.getElementById('contactMessage')?.value
    };
    
    try {
        const response = await fetch(`${API_URL}/contact`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showMessage('Mensagem enviada com sucesso!', 'success');
            document.getElementById('contactForm').reset();
        } else {
            showMessage(result.error || 'Erro ao enviar mensagem', 'error');
        }
    } catch (error) {
        console.error('Erro:', error);
        showMessage('Erro ao enviar mensagem', 'error');
    }
}

// Carregar produtos em destaque
async function loadFeaturedProducts() {
    const featuredDiv = document.getElementById('featuredProducts');
    if (!featuredDiv) return;
    
    const products = await loadProducts();
    const featured = products.slice(0, 4);
    
    featuredDiv.innerHTML = featured.map(product => `
        <div class="product-card">
            <img src="${product.image}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/400x200?text=Produto'">
            <div class="product-info">
                <h3>${product.name}</h3>
                <div class="product-price">R$ ${product.price.toFixed(2)}</div>
                <button class="btn-add-to-cart" onclick="addToCart(${JSON.stringify(product).replace(/"/g, '&quot;')})">
                    Adicionar ao Carrinho
                </button>
            </div>
        </div>
    `).join('');
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    
    // Página de produtos
    if (document.getElementById('productsGrid')) {
        renderProducts();
        
        const categoryFilter = document.getElementById('categoryFilter');
        const searchInput = document.getElementById('searchInput');
        
        if (categoryFilter) {
            categoryFilter.addEventListener('change', renderProducts);
        }
        if (searchInput) {
            searchInput.addEventListener('input', renderProducts);
        }
    }
    
    // Página do carrinho
    if (document.getElementById('cartItems')) {
        loadCartPage();
    }
    
    // Página de checkout
    if (document.getElementById('checkoutForm')) {
        loadCheckoutPage();
        document.getElementById('checkoutForm').addEventListener('submit', finalizeOrder);
        
        const paymentOptions = document.querySelectorAll('input[name="payment"]');
        paymentOptions.forEach(option => {
            option.addEventListener('change', loadCheckoutPage);
        });
    }
    
    // Página de contato
    if (document.getElementById('contactForm')) {
        document.getElementById('contactForm').addEventListener('submit', sendContactMessage);
    }
    
    // Página inicial
    if (document.getElementById('featuredProducts')) {
        loadFeaturedProducts();
        
        const categoryCards = document.querySelectorAll('.category-card');
        categoryCards.forEach(card => {
            card.addEventListener('click', () => {
                const category = card.dataset.category;
                window.location.href = `products.html?category=${category}`;
            });
        });
    }
});

// Exportar funções para uso global
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateQuantity = updateQuantity;
