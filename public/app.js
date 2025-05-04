const tg = window.Telegram.WebApp;
tg.expand();

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

let cart = [];
let totalAmount = 0;

// Функция для обновления общей суммы
function updateTotalAmount() {
    totalAmount = cart.reduce((sum, item) => sum + item.price, 0);
    document.getElementById('total-amount').textContent = `Итого: ${totalAmount} ₽`;
    
    const orderButton = document.getElementById('order-button');
    orderButton.style.display = cart.length > 0 ? 'block' : 'none';
}

// Функция для добавления товара в корзину
function addToCart(productId, size) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const cartItem = {
        id: productId,
        title: product.title,
        price: product.price,
        size: size
    };

    cart.push(cartItem);
    updateTotalAmount();

    // Анимация кнопки
    const button = document.querySelector(`[data-product-id="${productId}"]`);
    button.classList.add('added');
    button.textContent = 'Добавлено ✓';
    
    setTimeout(() => {
        button.classList.remove('added');
        button.textContent = 'В корзину';
    }, 1500);

    tg.showPopup({
        title: 'Товар добавлен',
        message: `${product.title} (размер ${size}) добавлен в корзину`,
        buttons: [{type: 'ok'}]
    });
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
        addToCart(product.id, selectedSize);
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