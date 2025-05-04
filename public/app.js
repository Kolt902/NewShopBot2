const tg = window.Telegram.WebApp;
tg.expand();

// Основные элементы
const productGrid = document.getElementById('productGrid');
const searchInput = document.querySelector('.search-box input');
const brandButtons = document.querySelectorAll('.brand-btn');
const styleCards = document.querySelectorAll('.style-card');
const cartButton = document.querySelector('.nav-item:nth-child(2)');

// Состояние приложения
let products = [];
let cart = [];
let currentFilter = {
  style: '',
  brand: '',
  search: ''
};

// Загрузка товаров
async function loadProducts() {
  try {
    const response = await fetch('products.json');
    const data = await response.json();
    products = data.products;
    renderProducts(products);
  } catch (error) {
    console.error('Ошибка загрузки товаров:', error);
  }
}

// Отрисовка товаров
function renderProducts(productsToRender) {
  productGrid.innerHTML = '';
  const template = document.getElementById('productTemplate');

  productsToRender.forEach(product => {
    const clone = template.content.cloneNode(true);
    
    // Заполняем данные товара
    clone.querySelector('.product-image').src = `images/${product.images[0]}`;
    clone.querySelector('.product-name').textContent = product.name;
    clone.querySelector('.product-description').textContent = product.description;
    clone.querySelector('.product-category').textContent = product.category;
    clone.querySelector('.product-price').textContent = `${product.price.toLocaleString()} ₽`;
    clone.querySelector('.brand-tag').textContent = product.brand;

    // Размеры
    const sizeButtons = clone.querySelector('.size-buttons');
    product.sizes.forEach(size => {
      const button = document.createElement('button');
      button.className = 'size-btn';
      button.textContent = size;
      button.onclick = () => selectSize(button, product.id);
      sizeButtons.appendChild(button);
    });

    // Кнопка добавления в корзину
    const addToCartBtn = clone.querySelector('.add-to-cart-btn');
    addToCartBtn.onclick = () => addToCart(product);

    // Кнопка избранного
    const favoriteBtn = clone.querySelector('.favorite-btn');
    favoriteBtn.onclick = () => toggleFavorite(product.id);

    productGrid.appendChild(clone);
  });
}

// Фильтрация товаров
function filterProducts() {
  let filtered = products;

  if (currentFilter.style) {
    filtered = filtered.filter(p => p.style === currentFilter.style);
  }

  if (currentFilter.brand) {
    filtered = filtered.filter(p => p.brand === currentFilter.brand);
  }

  if (currentFilter.search) {
    const search = currentFilter.search.toLowerCase();
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(search) ||
      p.description.toLowerCase().includes(search) ||
      p.brand.toLowerCase().includes(search)
    );
  }

  renderProducts(filtered);
}

// Обработчики событий
searchInput.addEventListener('input', (e) => {
  currentFilter.search = e.target.value;
  filterProducts();
});

brandButtons.forEach(button => {
  button.addEventListener('click', () => {
    const brand = button.textContent;
    currentFilter.brand = brand === 'Все' ? '' : brand;
    
    // Обновляем активную кнопку
    brandButtons.forEach(btn => btn.classList.remove('active'));
    if (brand !== 'Все') button.classList.add('active');
    
    filterProducts();
  });
});

styleCards.forEach(card => {
  card.addEventListener('click', () => {
    const style = card.classList[1]; // old-money, streetwear, etc.
    currentFilter.style = style;
    filterProducts();
  });
});

// Функции корзины
function selectSize(button, productId) {
  // Убираем выделение с других кнопок размера
  const sizeButtons = button.parentElement.querySelectorAll('.size-btn');
  sizeButtons.forEach(btn => btn.classList.remove('selected'));
  button.classList.add('selected');
}

function addToCart(product) {
  const sizeButton = document.querySelector(`.product-card[data-id="${product.id}"] .size-btn.selected`);
  if (!sizeButton) {
    alert('Пожалуйста, выберите размер');
    return;
  }

  const selectedSize = sizeButton.textContent;
  const cartItem = {
    ...product,
    selectedSize,
    quantity: 1
  };

  cart.push(cartItem);
  updateCartButton();
}

function updateCartButton() {
  const cartCount = cart.length;
  if (cartCount > 0) {
    cartButton.classList.add('has-items');
    cartButton.querySelector('span').textContent = `Корзина (${cartCount})`;
  }
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
  loadProducts();
  
  // Настройка темы Telegram WebApp
  if (tg.colorScheme === 'dark') {
    document.body.classList.add('dark-theme');
  }
  
  // Показываем MainButton при наличии товаров в корзине
  tg.MainButton.setParams({
    text: 'Оформить заказ',
    color: '#000000'
  });
});

// Настройка навигации
function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            navItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
        });
    });

    // Обработчики категорий
    const styleCards = document.querySelectorAll('.style-card');
    styleCards.forEach(card => {
        card.addEventListener('click', () => {
            const style = card.classList[1]; // old-money, streetwear, etc.
            filterProducts(style);
        });
    });

    // Обработчики брендов
    const brandBtns = document.querySelectorAll('.brand-btn');
    brandBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const brand = btn.textContent;
            filterProducts(null, brand);
        });
    });
}

// Товары магазина
const products = [
    {
        id: 1,
        title: 'Футболка Classic',
        price: 1999,
        image: 'https://via.placeholder.com/150',
        sizes: ['S', 'M', 'L', 'XL']
    },
    {
        id: 2,
        title: 'Джинсы Regular',
        price: 3999,
        image: 'https://via.placeholder.com/150',
        sizes: ['30', '32', '34', '36']
    },
    {
        id: 3,
        title: 'Кроссовки Sport',
        price: 5999,
        image: 'https://via.placeholder.com/150',
        sizes: ['40', '41', '42', '43', '44']
    }
];

let totalAmount = 0;

// Функция для обновления общей суммы
function updateTotalAmount() {
    totalAmount = cart.reduce((sum, item) => sum + item.price, 0);
    document.getElementById('total-amount').textContent = `Итого: ${totalAmount} ₽`;
    
    const orderButton = document.getElementById('order-button');
    orderButton.style.display = cart.length > 0 ? 'block' : 'none';
}

// Функция для оформления заказа
function checkout() {
    if (cart.length === 0) {
        tg.showPopup({
            title: 'Корзина пуста',
            message: 'Добавьте товары в корзину',
            buttons: [{type: 'ok'}]
        });
        return;
    }

    const order = {
        items: cart,
        total: totalAmount
    };

    tg.sendData(JSON.stringify(order));
}

// Функция для создания карточки товара
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';

    const image = document.createElement('img');
    image.className = 'product-image';
    image.src = product.image;
    image.alt = product.title;

    const title = document.createElement('h3');
    title.className = 'product-title';
    title.textContent = product.title;

    const price = document.createElement('p');
    price.className = 'product-price';
    price.textContent = `${product.price} ₽`;

    const sizeSelect = document.createElement('select');
    sizeSelect.className = 'size-select';
    
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Выберите размер';
    defaultOption.disabled = true;
    defaultOption.selected = true;
    sizeSelect.appendChild(defaultOption);

    product.sizes.forEach(size => {
        const option = document.createElement('option');
        option.value = size;
        option.textContent = size;
        sizeSelect.appendChild(option);
    });

    const addButton = document.createElement('button');
    addButton.className = 'add-to-cart-button';
    addButton.textContent = 'В корзину';
    addButton.dataset.productId = product.id;
    addButton.onclick = () => {
        const selectedSize = sizeSelect.value;
        if (!selectedSize) {
            tg.showPopup({
                title: 'Выберите размер',
                message: 'Пожалуйста, выберите размер перед добавлением в корзину',
                buttons: [{type: 'ok'}]
            });
            return;
        }
        addToCart(product);
    };

    card.appendChild(image);
    card.appendChild(title);
    card.appendChild(price);
    card.appendChild(sizeSelect);
    card.appendChild(addButton);

    return card;
}

// Инициализация приложения
function initApp() {
    const productsContainer = document.getElementById('products');
    products.forEach(product => {
        productsContainer.appendChild(createProductCard(product));
    });

    updateTotalAmount();
}

// Запуск приложения после загрузки страницы
document.addEventListener('DOMContentLoaded', initApp);

// Инициализация Telegram Web App
tg.ready(); 