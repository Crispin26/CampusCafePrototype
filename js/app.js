// --- Data Models (Mocking the database) ---
const menu = [
    { 
        id: 1, 
        name: "Caramel Macchiato", 
        desc: "Freshly pulled espresso with vanilla-flavored syrup, milk and ice, topped with a caramel drizzle.", 
        basePrice: 4.50, 
        image: "https://images.unsplash.com/photo-1485808191679-5f86510681a2?auto=format&fit=crop&w=300&q=80", 
        soldOut: false 
    },
    { 
        id: 2, 
        name: "Iced Latte", 
        desc: "Our dark, rich espresso combined with milk and served over ice. A perfect pick-me-up.", 
        basePrice: 3.75, 
        image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=300&q=80", 
        soldOut: false 
    },
    { 
        id: 3, 
        name: "Blueberry Muffin", 
        desc: "A delicious, freshly baked muffin bursting with wild blueberries and topped with a sugar crumb.", 
        basePrice: 2.50, 
        image: "https://images.unsplash.com/photo-1607958996333-41aef7caefaa?auto=format&fit=crop&w=300&q=80", 
        soldOut: true 
    },
    { 
        id: 4, 
        name: "Matcha Green Tea", 
        desc: "Smooth and creamy matcha sweetened just right and served with steamed milk.", 
        basePrice: 4.25, 
        image: "https://images.unsplash.com/photo-1515823662972-da6a2e4d3002?auto=format&fit=crop&w=300&q=80", 
        soldOut: false 
    },
    { 
        id: 5, 
        name: "Cold Brew Coffee", 
        desc: "Handcrafted in small batches daily, slow-steeped in cool water for 20 hours.", 
        basePrice: 4.00, 
        image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=300&q=80", 
        soldOut: false 
    }
];

const sizes = [
    { label: "Small", multiplier: 1 },
    { label: "Medium", multiplier: 1.25 },
    { label: "Large", multiplier: 1.5 }
];

// --- Application State ---
let cart = [];
let currentItem = null;
let selectedSize = sizes[0];
let studentId = "";

// --- Initialization ---
document.addEventListener("DOMContentLoaded", () => {
    renderMenu();
    generateTimeSlots();
});

// --- View Navigation ---
function showView(viewId) {
    document.querySelectorAll('.view').forEach(el => {
        el.classList.remove('active');
        el.classList.add('hidden');
    });
    const activeView = document.getElementById(viewId);
    activeView.classList.remove('hidden');
    // small timeout allows the display:block to apply before animating opacity
    setTimeout(() => activeView.classList.add('active'), 10);

    if(viewId === 'view-cart') renderCart();
    if(viewId === 'view-pay') {
        document.getElementById('pay-total').innerText = getCartTotal();
        document.getElementById('pay-student-id').innerText = studentId || "1029 3847"; // fallback mock ID
    }
}

function login() {
    const idInput = document.getElementById('student-id').value;
    if(idInput.trim() === "") {
        alert("Please enter a Student ID to continue.");
        return;
    }
    studentId = idInput;
    showView('view-menu');
}

// --- Menu Rendering ---
function renderMenu() {
    const container = document.getElementById('menu-container');
    container.innerHTML = '';

    menu.forEach(item => {
        const isOut = item.soldOut;
        const opacityClass = isOut ? 'opacity-50 grayscale' : '';
        const buttonHtml = isOut
            ? `<div class="bg-gray-100 text-gray-500 px-3 py-1.5 rounded-lg text-sm font-bold border border-gray-200 shadow-inner">Sold Out</div>`
            : `<button onclick="openModal(${item.id})" class="bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white px-4 py-2 rounded-xl text-sm font-bold transition shadow-sm border border-blue-100"><i class="fa-solid fa-plus"></i> Add</button>`;

        const html = `
            <div class="bg-white rounded-2xl shadow-sm mb-4 p-4 flex items-center border border-gray-100 transition-transform active:scale-95 ${opacityClass}">
                <img src="${item.image}" alt="${item.name}" class="w-24 h-24 rounded-xl object-cover mr-4 shadow-sm">
                <div class="flex-1">
                    <h3 class="font-bold text-gray-800 text-lg leading-tight mb-1">${item.name}</h3>
                    <p class="text-xs text-gray-500 mb-2 line-clamp-2">${item.desc}</p>
                    <div class="flex justify-between items-center">
                        <p class="font-black text-gray-800">$${item.basePrice.toFixed(2)}</p>
                        ${buttonHtml}
                    </div>
                </div>
            </div>
        `;
        container.innerHTML += html;
    });
}

// --- Options Modal Logic ---
function openModal(itemId) {
    currentItem = menu.find(m => m.id === itemId);
    selectedSize = sizes[0]; // Reset to small by default

    document.getElementById('modal-title').innerText = currentItem.name;
    document.getElementById('modal-desc').innerText = currentItem.desc;
    renderSizes();
    updateModalPrice();

    const modal = document.getElementById('modal-options');
    const content = document.getElementById('modal-content');
    
    modal.classList.remove('hidden');
    // Trigger transition
    setTimeout(() => {
        modal.classList.add('opacity-100');
        content.classList.remove('translate-y-full');
    }, 10);
}

function closeModal() {
    const modal = document.getElementById('modal-options');
    const content = document.getElementById('modal-content');
    
    // Add closing transform
    content.classList.add('translate-y-full');
    modal.classList.remove('opacity-100');
    
    setTimeout(() => {
        modal.classList.add('hidden');
    }, 300); // matches the tailwind transition duration
}

function renderSizes() {
    const container = document.getElementById('size-options');
    container.innerHTML = '';
    sizes.forEach(size => {
        const isSelected = size.label === selectedSize.label;
        const btnClass = isSelected 
            ? 'bg-blue-600 text-white shadow-md border-blue-600' 
            : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-200';
            
        container.innerHTML += `
            <button onclick="selectSize('${size.label}')" class="flex-1 py-3 border rounded-xl font-bold transition text-sm ${btnClass}">
                ${size.label}
            </button>
        `;
    });
}

function selectSize(label) {
    selectedSize = sizes.find(s => s.label === label);
    renderSizes();
    updateModalPrice();
}

function updateModalPrice() {
    const price = currentItem.basePrice * selectedSize.multiplier;
    document.getElementById('modal-price').innerText = price.toFixed(2);
}

// --- Cart Logic ---
function addToCart() {
    const price = currentItem.basePrice * selectedSize.multiplier;
    cart.push({
        id: Date.now(), // unique ID for cart instance
        item: currentItem,
        size: selectedSize,
        price: price
    });
    updateCartBadge();
    closeModal();
    
    // Quick visual feedback on cart icon
    const icon = document.querySelector('.fa-cart-shopping');
    icon.classList.add('text-blue-200');
    setTimeout(() => icon.classList.remove('text-blue-200'), 200);
}

function updateCartBadge() {
    const badge = document.getElementById('cart-count');
    badge.innerText = cart.length;
    if(cart.length > 0) {
        badge.classList.remove('hidden');
        badge.classList.add('animate-bounce');
        setTimeout(() => badge.classList.remove('animate-bounce'), 1000);
    } else {
        badge.classList.add('hidden');
    }
}

function renderCart() {
    const container = document.getElementById('cart-items');
    container.innerHTML = '';
    
    if (cart.length === 0) {
        container.innerHTML = `
            <div class="flex flex-col items-center justify-center h-48 text-gray-400 mt-10">
                <i class="fa-solid fa-basket-shopping text-5xl mb-4 opacity-50"></i>
                <p class="font-medium">Your cart is empty.</p>
                <button onclick="showView('view-menu')" class="mt-4 text-blue-500 font-bold hover:underline">Browse Menu</button>
            </div>
        `;
        document.getElementById('cart-total').innerText = "0.00";
        document.querySelector('#view-cart .border-t-2 button').disabled = true;
        document.querySelector('#view-cart .border-t-2 button').classList.add('opacity-50', 'cursor-not-allowed');
        return;
    }

    // Enable checkout button
    document.querySelector('#view-cart .border-t-2 button').disabled = false;
    document.querySelector('#view-cart .border-t-2 button').classList.remove('opacity-50', 'cursor-not-allowed');

    cart.forEach(cartItem => {
        const html = `
            <div class="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div class="flex-1">
                    <h4 class="font-bold text-gray-800">${cartItem.item.name}</h4>
                    <p class="text-xs text-gray-500 font-medium mt-1"><span class="bg-gray-100 px-2 py-1 rounded-md text-gray-600">Size: ${cartItem.size.label}</span></p>
                </div>
                <div class="flex items-center gap-4 ml-4">
                    <span class="font-black text-gray-800">$${cartItem.price.toFixed(2)}</span>
                    <button onclick="removeFromCart(${cartItem.id})" class="text-red-400 hover:text-red-600 bg-red-50 p-2 rounded-lg transition"><i class="fa-solid fa-trash"></i></button>
                </div>
            </div>
        `;
        container.innerHTML += html;
    });

    document.getElementById('cart-total').innerText = getCartTotal();
}

function removeFromCart(id) {
    cart = cart.filter(c => c.id !== id);
    updateCartBadge();
    renderCart();
}

function getCartTotal() {
    const total = cart.reduce((sum, item) => sum + item.price, 0);
    return total.toFixed(2);
}

// --- Time Slots Generation ---
function generateTimeSlots() {
    const select = document.getElementById('pickup-time');
    const now = new Date();
    // Start at least 15 mins from now to give barista time
    let nextSlot = new Date(now.getTime() + 15 * 60000); 
    // Round up to the nearest 5-minute mark
    nextSlot.setMinutes(Math.ceil(nextSlot.getMinutes() / 5) * 5);
    nextSlot.setSeconds(0);

    for(let i=0; i<12; i++) {
        const timeString = nextSlot.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        select.innerHTML += `<option value="${timeString}">${timeString} (Available)</option>`;
        nextSlot.setMinutes(nextSlot.getMinutes() + 5);
    }
}

// --- Checkout & Success Flow ---
function processPayment() {
    const btn = document.getElementById('btn-pay');
    const originalHTML = btn.innerHTML;
    
    // Visual feedback for processing
    btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin mr-2"></i> Processing Payment...';
    btn.disabled = true;
    
    // Simulate network delay
    setTimeout(() => {
        const selectElement = document.getElementById('pickup-time');
        const selectedText = selectElement.options[selectElement.selectedIndex].text.split(' ')[0] + ' ' + selectElement.options[selectElement.selectedIndex].text.split(' ')[1];
        
        document.getElementById('success-time').innerText = selectedText;
        // Generate random 4-digit order number
        document.getElementById('order-number').innerText = Math.floor(1000 + Math.random() * 9000);
        
        showView('view-success');
        
        // Reset cart for next order
        cart = [];
        updateCartBadge();
        
        // Reset button
        btn.innerHTML = originalHTML;
        btn.disabled = false;
    }, 1500);
}

function resetApp() {
    showView('view-menu');
    // Scroll menu to top
    document.getElementById('menu-container').scrollTop = 0;
}
