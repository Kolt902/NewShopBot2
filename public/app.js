// Initialize Telegram WebApp
let tg = window.Telegram.WebApp;

// Configure WebApp
tg.expand();
tg.enableClosingConfirmation();

// Sample products data
const products = [
    {
        id: 1,
        name: "Твидовый пиджак Old Money",
        price: 15990,
        category: "oldmoney",
        gender: "men",
        sizes: ["S", "M", "L", "XL"],
        image: "https://i.imgur.com/YKZhxgY.jpeg"
    },
    {
        id: 2,
        name: "Кашемировое пальто",
        price: 29990,
        category: "oldmoney",
        gender: "women",
        sizes: ["XS", "S", "M", "L"],
        image: "https://i.imgur.com/L2rEPxE.jpeg"
    },
    {
        id: 3,
        name: "Оверсайз худи Street",
        price: 8990,
        category: "streetwear",
        gender: "unisex",
        sizes: ["S", "M", "L", "XL"],
        image: "https://i.imgur.com/dO6LmHl.jpeg"
    },
    {
        id: 4,
        name: "Кожаная сумка Luxury",
        price: 45990,
        category: "luxury",
        gender: "women",
        sizes: ["ONE SIZE"],
        image: "https://i.imgur.com/9wGwPCZ.jpeg"
    },
    {
        id: 5,
        name: "Спортивный костюм Pro",
        price: 11990,
        category: "sport",
        gender: "unisex",
        sizes: ["S", "M", "L", "XL"],
        image: "https://i.imgur.com/2VQgZX2.jpeg"
    }
];

// Cart state
let cart = [];
let selectedCategory = 'all';
let selectedGender = 'all';
let totalAmount = 0;

// Get URL parameters
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.has('category')) {
    selectedCategory = urlParams.get('category');
    document.querySelector(`.category-btn[data-category="${selectedCategory}"]`)?.classList.add('active');
}
if (urlParams.has('gender')) {
    selectedGender = urlParams.get('gender');
    document.querySelector(`.gender-btn[data-gender="${selectedGender}"]`)?.classList.add('active');
}

// DOM Elements
const productsGrid = document.getElementById('productsGrid');
const cartButton = document.getElementById('cartButton');
const cartModal = document.getElementById('cartModal');
const cartItems = document.getElementById('cartItems');
const cartCount = document.getElementById('cartCount');
const cartTotal = document.getElementById('cartTotal');
const checkoutBtn = document.getElementById('checkoutBtn');

// Initialize the shop
function initializeShop() {
    // Set up category filters
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelector('.category-btn.active')?.classList.remove('active');
            btn.classList.add('active');
            selectedCategory = btn.dataset.category;
            renderProducts();
        });
    });

    // Set up gender filters
    document.querySelectorAll('.gender-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelector('.gender-btn.active')?.classList.remove('active');
            btn.classList.add('active');
            selectedGender = btn.dataset.gender;
            renderProducts();
        });
    });

    cartButton.addEventListener('click', toggleCart);
    checkoutBtn.addEventListener('click', handleCheckout);

    // Initial render
    renderProducts();
    updateCart();

    // Show back button in Telegram Web App
    tg.BackButton.show();
    tg.BackButton.onClick(() => {
        if (cartModal.classList.contains('active')) {
            toggleCart();
        } else {
            tg.close();
        }
    });
}

// Render products
function renderProducts() {
    const filteredProducts = products.filter(product => {
        const categoryMatch = selectedCategory === 'all' || product.category === selectedCategory;
        const genderMatch = selectedGender === 'all' || product.gender === selectedGender || product.gender === 'unisex';
        return categoryMatch && genderMatch;
    });

    productsGrid.innerHTML = filteredProducts.map(product => `
        <div class="product-card" data-id="${product.id}">
            <img class="product-image" src="${product.image}" alt="${product.name}" loading="lazy">
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <p class="product-price">${formatPrice(product.price)} ₽</p>
                <div class="size-selector">
                    ${product.sizes.map(size => `
                        <button class="size-btn" data-size="${size}">${size}</button>
                    `).join('')}
                </div>
                <button class="add-to-cart">В корзину</button>
            </div>
        </div>
    `).join('');

    // Set up size selection and add to cart buttons
    document.querySelectorAll('.product-card').forEach(card => {
        const productId = parseInt(card.dataset.id);

        card.querySelectorAll('.size-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                card.querySelector('.size-btn.selected')?.classList.remove('selected');
                btn.classList.add('selected');
            });
        });

        card.querySelector('.add-to-cart').addEventListener('click', () => {
            const selectedSize = card.querySelector('.size-btn.selected')?.dataset.size;
            if (!selectedSize) {
                alert('Пожалуйста, выберите размер');
                return;
            }
            addToCart(productId, selectedSize);
        });
    });
}

// Cart functions
function addToCart(productId, size) {
    const product = products.find(p => p.id === productId);
    const existingItem = cart.find(item => item.id === productId && item.size === size);
    
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({
            ...product,
            size: size,
            quantity: 1
        });
    }

    updateCart();
    tg.HapticFeedback.impactOccurred('medium');
}

function updateCart() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    
    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div>
                <h4>${item.name}</h4>
                <p>Размер: ${item.size}</p>
                <p>Количество: ${item.quantity}</p>
            </div>
            <div>
                <p>${formatPrice(item.price * item.quantity)} ₽</p>
                <button onclick="removeFromCart(${item.id}, '${item.size}')">Удалить</button>
            </div>
        </div>
    `).join('');

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotal.textContent = `${formatPrice(total)} ₽`;

    // Update Main Button
    if (cart.length > 0) {
        tg.MainButton.setText(`Оформить заказ • ${formatPrice(total)} ₽`);
        tg.MainButton.show();
    } else {
        tg.MainButton.hide();
    }

    totalAmount = total;
}

function removeFromCart(productId, size) {
    cart = cart.filter(item => !(item.id === productId && item.size === size));
    updateCart();
    tg.HapticFeedback.impactOccurred('light');
}

function toggleCart() {
    cartModal.classList.toggle('active');
    if (cartModal.classList.contains('active')) {
        tg.BackButton.show();
    } else {
        tg.BackButton.hide();
    }
}

function handleCheckout() {
    if (cart.length === 0) {
        alert('Корзина пуста');
        return;
    }

    const orderData = {
        items: cart,
        totalAmount: formatPrice(totalAmount)
    };

    tg.sendData(JSON.stringify(orderData));
    cart = [];
    updateCart();
    toggleCart();
    tg.HapticFeedback.notificationOccurred('success');
}

// Utility functions
function formatPrice(price) {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

// Initialize the shop when the page loads
document.addEventListener('DOMContentLoaded', () => {
    tg.ready();
    initializeShop();
}); 