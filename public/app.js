// Initialize Telegram WebApp
const tg = window.Telegram.WebApp;
tg.expand();

// Get URL parameters
const urlParams = new URLSearchParams(window.location.search);
const selectedCategory = urlParams.get('category');
const selectedGender = urlParams.get('gender');

// Main elements
const productGrid = document.getElementById('productGrid');
const searchInput = document.querySelector('.search-box input');
const brandButtons = document.querySelectorAll('.brand-btn');
const styleCards = document.querySelectorAll('.style-card');
const cartButton = document.querySelector('.nav-item:nth-child(2)');

// App state
let cart = [];
let currentFilter = {
  category: selectedCategory || '',
  gender: selectedGender || '',
  search: ''
};

// Load products
async function loadProducts() {
  try {
    const response = await fetch('products.json');
    const data = await response.json();
    let filteredProducts = data.products;

    // Apply filters
    if (currentFilter.category) {
      filteredProducts = filteredProducts.filter(p => p.category === currentFilter.category);
    }
    if (currentFilter.gender) {
      filteredProducts = filteredProducts.filter(p => p.gender === currentFilter.gender || p.gender === 'unisex');
    }
    if (currentFilter.search) {
      const search = currentFilter.search.toLowerCase();
      filteredProducts = filteredProducts.filter(p => 
        p.name.toLowerCase().includes(search) ||
        p.description.toLowerCase().includes(search)
      );
    }

    displayProducts(filteredProducts);
  } catch (error) {
    console.error('Error loading products:', error);
  }
}

// Display products
function displayProducts(products) {
  productGrid.innerHTML = '';
  const template = document.getElementById('productTemplate');

  products.forEach(product => {
    const clone = template.content.cloneNode(true);
    
    // Set product details
    const img = clone.querySelector('.product-image');
    img.src = product.images[0];
    img.alt = product.name;
    
    clone.querySelector('.product-name').textContent = product.name;
    clone.querySelector('.product-description').textContent = product.description;
    clone.querySelector('.product-price').textContent = `${product.price.toLocaleString()} ₽`;

    // Create size buttons
    const sizeButtons = clone.querySelector('.size-buttons');
    product.sizes.forEach(size => {
      const button = document.createElement('button');
      button.className = 'size-btn';
      button.textContent = size;
      button.onclick = () => selectSize(button);
      sizeButtons.appendChild(button);
    });

    // Add to cart button
    const addToCartBtn = clone.querySelector('.add-to-cart-btn');
    addToCartBtn.onclick = () => addToCart(product);

    // Favorite button
    const favoriteBtn = clone.querySelector('.favorite-btn');
    favoriteBtn.onclick = () => toggleFavorite(product.id);

    productGrid.appendChild(clone);
  });
}

// Event handlers
searchInput?.addEventListener('input', (e) => {
  currentFilter.search = e.target.value;
  loadProducts();
});

styleCards?.forEach(card => {
  card.addEventListener('click', () => {
    currentFilter.category = card.dataset.category;
    loadProducts();
  });
});

// Cart functions
function selectSize(button) {
  const parent = button.parentElement;
  parent.querySelectorAll('.size-btn').forEach(btn => {
    btn.classList.remove('selected');
  });
  button.classList.add('selected');
}

function addToCart(product) {
  const selectedSize = document.querySelector('.size-btn.selected')?.textContent;
  if (!selectedSize) {
    tg.showPopup({
      title: 'Выберите размер',
      message: 'Пожалуйста, выберите размер перед добавлением в корзину',
      buttons: [{type: 'ok'}]
    });
    return;
  }

  cart.push({
    ...product,
    selectedSize,
    quantity: 1
  });
  
  updateCartButton();
  tg.MainButton.show();
}

function updateCartButton() {
  const cartCount = cart.length;
  if (cartCount > 0) {
    cartButton.classList.add('has-items');
    cartButton.querySelector('span').textContent = `Корзина (${cartCount})`;
    
    tg.MainButton.setParams({
      text: `Оформить заказ (${cartCount})`,
      color: '#000000'
    });
  }
}

// Toggle favorite
function toggleFavorite(productId) {
  const btn = document.querySelector(`[data-product-id="${productId}"] .favorite-btn`);
  btn.classList.toggle('active');
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadProducts();
  
  if (tg.colorScheme === 'dark') {
    document.body.classList.add('dark-theme');
  }
  
  tg.MainButton.setParams({
    text: 'Оформить заказ',
    color: '#000000'
  });
  tg.MainButton.hide();
});

// Initialize Telegram Web App
tg.ready(); 