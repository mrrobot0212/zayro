const API_BASE = "http://localhost:5000/api";

// ১. নতুন প্রোডাক্ট ও কোয়ান্টিটি ডাটাবেজে পাঠানো (রিলোড প্রুফ)
document.getElementById('admin-add-product-form')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const productData = {
        name: document.getElementById('p-name').value,
        price: Number(document.getElementById('p-price').value),
        stock: Number(document.getElementById('p-stock').value),
        img: document.getElementById('p-img').value
    };

    try {
        const res = await fetch(`${API_BASE}/products`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productData)
        });
        
        if (res.ok) {
            alert('🎉 প্রোডাক্ট এবং কোয়ান্টিটি সফলভাবে সেভ হয়েছে!');
            this.reset();
            loadInventory();
        }
    } catch (err) {
        alert('❌ ব্যাকএন্ড সার্ভার রেসপন্স করছে না!');
    }
});

// ২. ডাটাবেজ থেকে ইনভেন্টরি ও লাইভ স্টক লেভেল লোড করা
async function loadInventory() {
    try {
        const res = await fetch(`${API_BASE}/products`);
        const products = await res.json();
        const inventoryBody = document.getElementById('admin-product-inventory');
        if(!inventoryBody) return;

        if (products.length === 0) {
            inventoryBody.innerHTML = `<tr><td colspan="5" class="p-4 text-center text-slate-400">কোনো প্রোডাক্ট পাওয়া যায়নি।</td></tr>`;
            return;
        }

        inventoryBody.innerHTML = products.map(product => {
            const isOut = product.stock <= 0;
            return `
                <tr class="hover:bg-slate-50 transition border-b border-slate-100">
                    <td class="p-4"><img src="${product.img}" class="w-12 h-12 object-cover rounded-lg"></td>
                    <td class="p-4 font-bold text-slate-700">${product.name}</td>
                    <td class="p-4">৳${product.price}</td>
                    <td class="p-4">
                        ${isOut ? `<span class="px-2 py-1 bg-red-100 text-red-700 font-bold rounded-md text-xs">Stock Out</span>` 
                               : `<span class="font-semibold text-green-600">${product.stock} টি অবশিষ্ট</span>`}
                    </td>
                    <td class="p-4 flex items-center gap-2">
                        <input type="number" id="update-stock-${product._id}" value="${product.stock}" class="w-20 p-1.5 border rounded-lg text-center outline-none">
                        <button onclick="updateStockLevel('${product._id}')" class="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-700 transition">আপডেট</button>
                    </td>
                </tr>
            `;
        }).join('');
    } catch (err) {
        console.error(err);
    }
}

// ৩. নির্দিষ্ট প্রোডাক্টের স্টক ম্যানুয়ালি চেঞ্জ বা আপডেট করার ফাংশন
async function updateStockLevel(productId) {
    const newStockVal = document.getElementById(`update-stock-${productId}`).value;
    try {
        const res = await fetch(`${API_BASE}/products/${productId}/stock`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ stock: Number(newStockVal) })
        });
        if(res.ok) {
            alert('🔄 স্টক লেভেল সফলভাবে আপডেট করা হয়েছে!');
            loadInventory();
        }
    } catch (err) {
        alert('স্টক আপডেট করা সম্ভব হয়নি।');
    }
}

// ৪. কাস্টমারদের লাইভ অর্ডার ড্যাশবোর্ডে রিয়েল-টাইমে রেন্ডার করা
async function loadLiveOrders() {
    try {
        const res = await fetch(`${API_BASE}/orders`);
        const orders = await res.json();
        const tableBody = document.getElementById('admin-live-orders');
        if(!tableBody) return;

        if (orders.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="5" class="p-8 text-center text-slate-400 font-medium">📥 এখনো কোনো লাইভ অর্ডার আসেনি...</td></tr>`;
            return;
        }

        tableBody.innerHTML = orders.map(order => {
            const timeString = new Date(order.orderDate).toLocaleTimeString('bn-BD', {hour: '2-digit', minute:'2-digit'}) + " | " + new Date(order.orderDate).toLocaleDateString('bn-BD');
            return `
                <tr class="hover:bg-slate-50 transition border-b border-slate-100">
                    <td class="p-4">
                        <div class="font-bold text-slate-800">${order.customerName}</div>
                        <div class="text-xs text-indigo-600 font-semibold"><i class="fas fa-phone-alt"></i> ${order.customerPhone}</div>
                    </td>
                    <td class="p-4">
                        <span class="px-2 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium border border-slate-200">
                            <i class="fas fa-map-marker-alt text-red-500"></i> ${order.customerAddress}
                        </span>
                    </td>
                    <td class="p-4 font-medium text-slate-600">
                        ${order.items.map(i => `<span class="block text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded my-0.5">${i.name} (x${i.quantity})</span>`).join('')}
                    </td>
                    <td class="p-4 font-bold text-green-600">৳${order.totalAmount}</td>
                    <td class="p-4 text-xs text-slate-400 font-mono">${timeString}</td>
                </tr>
            `;
        }).join('');
    } catch (err) {
        console.error(err);
    }
}

// পেজ বুটস্ট্র্যাপ
loadInventory();
loadLiveOrders();
setInterval(loadLiveOrders, 5000); // প্রতি ৫ সেকেন্ড পর পর ব্যাকএন্ডে চেক করবে