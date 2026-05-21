// --- 💾 LOCALSTORAGE DATA STABILIZERS (স্থায়ী ডেটা স্টোরেজ) ---
let products = JSON.parse(localStorage.getItem('zayro_products')) || [
    { id: 1, name: "Yeezy Comfort Slides", price: 45.00, image: "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=500", sizes: ["39-40", "40-41", "41-42", "42-43", "43-44"], colors: ["Matte Black", "Bone White", "Olive Green"] },
    { id: 2, name: "Classic Summer Beach Slides", price: 25.50, image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=500", sizes: ["39-40", "40-41", "41-42", "42-43", "43-44"], colors: ["Navy Blue", "Sand Beige", "Matte Black"] },
    { id: 3, name: "CloudFoam Ultra Cushioned Slides", price: 35.00, image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500", sizes: ["39-40", "40-41", "41-42", "42-43", "43-44"], colors: ["Graphite Gray", "Neon Orange", "Bone White"] }
];

let orders = JSON.parse(localStorage.getItem('zayro_orders')) || [];
let cart = [];
let isAdminLoggedIn = false;

// 📈 VISITOR COUNTER LOGIC
let visitorsCount = parseInt(localStorage.getItem('zayro_visitors')) || 0;
if (!sessionStorage.getItem('zayro_visited_session')) {
    visitorsCount += 1;
    localStorage.setItem('zayro_visitors', visitorsCount);
    sessionStorage.setItem('zayro_visited_session', 'true');
}

const ADMIN_CREDENTIALS = { email: "admin@shop.com", password: "admin123" };
const DELIVERY_RATES = { inside: 2.00, outside: 5.00 };

// --- 📊 ANALYTICS CALCULATIONS (আজ, ৭ দিন ও ৩০ দিনের হিসাব) ---
function calculateBusinessMetrics() {
    const now = new Date();
    let totalRevenue = 0;
    let todayOrders = 0;
    let todayRevenue = 0;
    let last7DaysRevenue = 0;
    let last30DaysRevenue = 0;

    orders.forEach(order => {
        totalRevenue += order.total;
        const orderDate = new Date(order.timestamp);
        const diffTime = Math.abs(now - orderDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // Today's Calc
        if (orderDate.toDateString() === now.toDateString()) {
            todayOrders++;
            todayRevenue += order.total;
        }
        // 7 Days Calc
        if (diffDays <= 7) {
            last7DaysRevenue += order.total;
        }
        // 30 Days Calc
        if (diffDays <= 30) {
            last30DaysRevenue += order.total;
        }
    });

    return { totalRevenue, todayOrders, todayRevenue, last7DaysRevenue, last30DaysRevenue };
}

// --- 🖥️ RENDER ADMIN DASHBOARD (প্রফেশনাল লুক) ---
function renderAdminDashboard() {
    const metrics = calculateBusinessMetrics();
    const adminDashboardView = document.getElementById('admin-dashboard-view');
    
    // Injecting Professional Business Cards on top of the Admin View
    adminDashboardView.innerHTML = `
        <div class="flex flex-col sm:flex-row justify-between items-center border-b border-gray-200 pb-5 mb-8 gap-4">
            <div>
                <h2 class="text-3xl font-black text-gray-900 tracking-tight">Zayro Control Tower 🚀</h2>
                <p class="text-sm text-gray-500">Real-time live operational overview</p>
            </div>
            <button onclick="logoutAdmin()" class="w-full sm:w-auto bg-red-500 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-red-600 transition shadow-md">Logout Dashboard</button>
        </div>

        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div class="bg-gradient-to-br from-indigo-500 to-indigo-600 p-4 rounded-2xl text-white shadow-md">
                <p class="text-xs font-bold uppercase opacity-80">Total Revenue</p>
                <p class="text-2xl font-black mt-1">$${metrics.totalRevenue.toFixed(2)}</p>
                <p class="text-[10px] mt-2 opacity-90">Lifetime Earning</p>
            </div>
            <div class="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                <p class="text-xs font-bold uppercase text-gray-400">Today's Sales</p>
                <p class="text-2xl font-black text-gray-900 mt-1">$${metrics.todayRevenue.toFixed(2)}</p>
                <p class="text-[10px] text-green-500 font-bold mt-2">🛍️ ${metrics.todayOrders} Orders Today</p>
            </div>
            <div class="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                <p class="text-xs font-bold uppercase text-gray-400">7 Days / 30 Days</p>
                <p class="text-xl font-black text-gray-900 mt-1">$${metrics.last7DaysRevenue.toFixed(2)} <span class="text-xs font-normal text-gray-400">/ $${metrics.last30DaysRevenue.toFixed(2)}</span></p>
                <p class="text-[10px] text-indigo-600 font-medium mt-2">Filtered dynamic sales</p>
            </div>
            <div class="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                <p class="text-xs font-bold uppercase text-gray-400">Live Traffic</p>
                <p class="text-2xl font-black text-gray-900 mt-1">${visitorsCount}</p>
                <p class="text-[10px] text-blue-500 font-bold mt-2">👥 Total Website Visitors</p>
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
                <h3 class="text-lg font-bold mb-4 text-gray-900">Add New Slide Variant</h3>
                <form id="add-product-form" class="space-y-4">
                    <div>
                        <label class="block text-xs font-bold text-gray-500 uppercase">Slide Name</label>
                        <input type="text" id="prod-name" required class="mt-1 block w-full rounded-xl border-gray-200 p-3 bg-gray-50 border focus:outline-indigo-500 text-sm">
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-gray-500 uppercase">Price ($)</label>
                        <input type="number" step="0.01" id="prod-price" required class="mt-1 block w-full rounded-xl border-gray-200 p-3 bg-gray-50 border focus:outline-indigo-500 text-sm">
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-gray-500 uppercase">Image URL</label>
                        <input type="url" id="prod-image" placeholder="https://..." class="mt-1 block w-full rounded-xl border-gray-200 p-3 bg-gray-50 border focus:outline-indigo-500 text-sm">
                    </div>
                    <button type="submit" class="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition shadow-md">Publish to Store</button>
                </form>
            </div>

            <div class="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-bold text-gray-900">Live Customer Orders (${orders.length})</h3>
                    <button onclick="clearAllOrders()" class="text-xs text-red-500 font-bold hover:underline">Clear History</button>
                </div>
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-100">
                        <tbody id="orders-table-body" class="bg-white divide-y divide-gray-100">
                            </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;

    // Re-bind form event listener after DOM injection
    document.getElementById('add-product-form').addEventListener('submit', handleAddProduct);
    renderAdminOrdersList();
}

function renderAdminOrdersList() {
    const tbody = document.getElementById('orders-table-body');
    tbody.innerHTML = '';

    if (orders.length === 0) {
        tbody.innerHTML = `<tr><td class="px-2 py-8 text-center text-sm text-gray-400 font-medium">No orders placed yet.</td></tr>`;
        return;
    }

    // Show newest orders first
    [...orders].reverse().forEach(order => {
        tbody.innerHTML += `
            <tr class="hover:bg-gray-50/80 transition">
                <td class="py-4 text-sm">
                    <div class="flex justify-between items-center mb-1.5">
                        <span class="font-extrabold text-indigo-600 text-sm">${order.id}</span>
                        <span class="px-2 py-0.5 text-[10px] font-black rounded-full bg-green-100 text-green-800">SUCCESS</span>
                    </div>
                    <div class="space-y-1 text-gray-700 text-xs">
                        <div class="text-sm font-bold text-gray-900">👤 ${order.customerName}</div>
                        <div>📞 Phone: <a href="tel:${order.customerPhone}" class="text-indigo-600 font-bold underline">${order.customerPhone}</a></div>
                        <div>📍 Destination: <span class="uppercase font-bold text-[10px] bg-gray-100 px-1 rounded">${order.zone}</span> | ${order.customerAddress}</div>
                        <div class="p-2 bg-gray-50 rounded-xl font-medium text-gray-900 border border-dashed border-gray-200 mt-1">🛍️ ${order.itemsSummary}</div>
                        <div class="text-right font-black text-sm text-gray-900 pt-1">Paid: $${order.total.toFixed(2)}</div>
                    </div>
                </td>
            </tr>
        `;
    });
}

// --- 🧭 NAVIGATION CORE ---
function switchView(viewName) {
    const storeContainer = document.getElementById('customer-store-container');
    const adminLoginView = document.getElementById('admin-login-view');
    const adminDashboardView = document.getElementById('admin-dashboard-view');
    
    storeContainer.classList.add('hidden');
    adminLoginView.classList.add('hidden');
    adminDashboardView.classList.add('hidden');

    if (viewName === 'store') {
        storeContainer.classList.remove('hidden');
    } else if (viewName === 'admin-login' || viewName === 'admin-dashboard') {
        if (isAdminLoggedIn) {
            adminDashboardView.classList.remove('hidden');
            renderAdminDashboard();
        } else {
            adminLoginView.classList.remove('hidden');
        }
    }
}

function toggleCart() {
    document.getElementById('cart-drawer').classList.toggle('hidden');
}

// --- 🛍️ FRONTEND STORE LOGIC ---
function renderStoreProducts() {
    const grid = document.getElementById('product-grid');
    if(!grid) return;
    grid.innerHTML = '';

    products.forEach(product => {
        let sizeOptions = product.sizes.map(size => `<option value="${size}">Size: ${size}</option>`).join('');
        let colorOptions = product.colors.map(color => `<option value="${color}">Color: ${color}</option>`).join('');

        grid.innerHTML += `
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col group transition duration-300 hover:shadow-xl">
                <div class="aspect-w-1 aspect-h-1 bg-gray-50 overflow-hidden h-52">
                    <img src="${product.image}" alt="${product.name}" class="w-full h-full object-center object-cover group-hover:scale-105 transition duration-500">
                </div>
                <div class="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                        <h3 class="text-sm font-bold text-gray-900 group-hover:text-indigo-600 transition">${product.name}</h3>
                        <p class="text-lg font-black text-indigo-600 mt-0.5">$${product.price.toFixed(2)}</p>
                        <div class="grid grid-cols-2 gap-2 pt-1">
                            <div>
                                <label class="block text-[9px] uppercase font-bold text-gray-400">Size:</label>
                                <select id="size-select-${product.id}" class="w-full text-xs bg-gray-50 border border-gray-200 rounded-lg p-1.5 focus:outline-indigo-500 font-semibold text-gray-700">${sizeOptions}</select>
                            </div>
                            <div>
                                <label class="block text-[9px] uppercase font-bold text-gray-400">Color:</label>
                                <select id="color-select-${product.id}" class="w-full text-xs bg-gray-50 border border-gray-200 rounded-lg p-1.5 focus:outline-indigo-500 font-semibold text-gray-700">${colorOptions}</select>
                            </div>
                        </div>
                    </div>
                    <button onclick="handleAddToCart(${product.id})" class="w-full bg-gray-950 text-white py-2.5 rounded-xl text-xs font-bold hover:bg-indigo-600 active:scale-95 transition">Add To Cart</button>
                </div>
            </div>
        `;
    });
}

function handleAddToCart(productId) {
    const product = products.find(p => p.id === productId);
    const selectedSize = document.getElementById(`size-select-${productId}`).value;
    const selectedColor = document.getElementById(`color-select-${productId}`).value;

    const existingItem = cart.find(item => item.product.id === productId && item.size === selectedSize && item.color === selectedColor);
    if (existingItem) { existingItem.quantity += 1; } 
    else { cart.push({ product, size: selectedSize, color: selectedColor, quantity: 1 }); }
    
    renderCartItems();
    updateCartSummary();
}

function removeFromCart(productId, size, color) {
    cart = cart.filter(item => !(item.product.id === productId && item.size === size && item.color === color));
    renderCartItems();
    updateCartSummary();
}

function renderCartItems() {
    const container = document.getElementById('cart-items-container');
    container.innerHTML = '';
    if (cart.length === 0) { container.innerHTML = '<p class="text-gray-400 text-center py-8 text-sm font-medium">Your cart is empty.</p>'; return; }

    cart.forEach(item => {
        container.innerHTML += `
            <div class="flex py-3 border-b border-gray-100 text-xs">
                <img src="${item.product.image}" class="h-16 w-16 object-cover rounded-xl border">
                <div class="ml-3 flex flex-1 flex-col justify-between">
                    <div>
                        <div class="flex justify-between font-bold text-gray-900">
                            <h4>${item.product.name}</h4>
                            <p class="text-indigo-600">$${(item.product.price * item.quantity).toFixed(2)}</p>
                        </div>
                        <p class="text-[10px] text-gray-400 mt-0.5">Size: ${item.size} | Color: ${item.color}</p>
                    </div>
                    <div class="flex items-end justify-between">
                        <p class="text-gray-400 font-medium">Qty ${item.quantity}</p>
                        <button onclick="removeFromCart(${item.product.id}, '${item.size}', '${item.color}')" class="font-bold text-red-500">Remove</button>
                    </div>
                </div>
            </div>
        `;
    });
}

function updateCartSummary() {
    let subtotal = 0; let totalItems = 0;
    cart.forEach(item => { subtotal += item.product.price * item.quantity; totalItems += item.quantity; });
    const zone = document.getElementById('delivery-zone').value;
    const deliveryCharge = cart.length > 0 ? DELIVERY_RATES[zone] : 0; 
    
    document.getElementById('cart-subtotal').innerText = `$${subtotal.toFixed(2)}`;
    document.getElementById('cart-delivery-fee').innerText = `$${deliveryCharge.toFixed(2)}`;
    document.getElementById('cart-total').innerText = `$${(subtotal + deliveryCharge).toFixed(2)}`;
    document.getElementById('cart-count').innerText = totalItems;
}

// --- 💳 CHECKOUT FORM PROCESSOR ---
document.getElementById('checkout-form').addEventListener('submit', function(e) {
    e.preventDefault();
    if (cart.length === 0) return;

    const name = document.getElementById('cust-name').value;
    const phone = document.getElementById('cust-phone').value;
    const address = document.getElementById('cust-address').value;
    const zone = document.getElementById('delivery-zone').value;

    let subtotal = 0;
    let itemsSummary = cart.map(item => { subtotal += item.product.price * item.quantity; return `${item.product.name} (${item.size}/${item.color}) [x${item.quantity}]`; }).join(', ');

    const finalTotal = subtotal + DELIVERY_RATES[zone];
    const orderID = "#ZR-" + Math.floor(100000 + Math.random() * 900000);

    // Create Order Object with Timestamp
    const orderObject = {
        id: orderID,
        customerName: name,
        customerPhone: phone,
        customerAddress: address,
        zone: zone,
        itemsSummary: itemsSummary,
        total: finalTotal,
        timestamp: new Date().toISOString() // Dynamic date tracker
    };

    orders.push(orderObject);
    localStorage.setItem('zayro_orders', JSON.stringify(orders)); // 💾 Save to localStorage instantly

    alert(`✉️ [Zayro SMS]\n\nDear ${name}, order ${orderID} placed successfully! Total: $${finalTotal.toFixed(2)}. We will call you at ${phone} soon.`);

    cart = []; renderCartItems(); updateCartSummary(); this.reset(); toggleCart();
    renderStoreProducts();
});

// --- 🔐 ADMIN SYSTEM CONFIG ---
document.getElementById('admin-login-form').addEventListener('submit', function(e) {
    e.preventDefault();
    if (document.getElementById('admin-email').value === ADMIN_CREDENTIALS.email && document.getElementById('admin-password').value === ADMIN_CREDENTIALS.password) {
        isAdminLoggedIn = true;
        switchView('admin-dashboard');
    } else { alert("❌ Invalid Admin Key!"); }
    this.reset();
});

function handleAddProduct(e) {
    e.preventDefault();
    const name = document.getElementById('prod-name').value;
    const price = parseFloat(document.getElementById('prod-price').value);
    let image = document.getElementById('prod-image').value || "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=500";

    const newProduct = {
        id: products.length + 1,
        name, price, image,
        sizes: ["39-40", "40-41", "41-42", "42-43", "43-44"],
        colors: ["Matte Black", "Bone White"]
    };

    products.push(newProduct);
    localStorage.setItem('zayro_products', JSON.stringify(products)); // 💾 Save to Storage
    renderStoreProducts();
    renderAdminDashboard();
    alert("🚀 New Slipper Variant Added permanently!");
}

function clearAllOrders() {
    if(confirm("Are you sure you want to delete all lifetime order histories?")) {
        orders = [];
        localStorage.setItem('zayro_orders', JSON.stringify(orders));
        renderAdminDashboard();
    }
}

function logoutAdmin() { isAdminLoggedIn = false; switchView('store'); }

// --- 🏁 MASTER INITIALIZER ---
document.addEventListener("DOMContentLoaded", () => {
    renderStoreProducts();
    updateCartSummary();
    if(products.length > 0 && document.getElementById('hero-dynamic-image')) {
        document.getElementById('hero-dynamic-image').src = products[0].image;
    }
});