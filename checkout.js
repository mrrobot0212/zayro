let cart = []; // গ্লোবাল কার্ট অ্যারে

// ১. কার্ট সাইডবার ওপেন/ক্লোজ টগল
function toggleCart() {
    document.getElementById('cart-sidebar').classList.toggle('translate-x-full');
}

// ২. কার্টে প্রোডাক্ট পুশ করা
function addToCart(productId) {
    const product = products.find(p => p._id === productId);
    if (!product || product.stock <= 0) return;

    const existingItem = cart.find(item => item._id === productId);
    if (existingItem) {
        if (existingItem.quantity >= product.stock) {
            alert('দুঃখিত! এই পণ্যটি স্টকে আর অবশিষ্ট নেই।');
            return;
        }
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    updateCartUI();
    document.getElementById('cart-sidebar').classList.remove('translate-x-full');
}

// ৩. কার্টের ইউজার ইন্টারফেস (UI) আপডেট করা
function updateCartUI() {
    const cartCount = document.getElementById('cart-count');
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if(totalItems > 0) {
        cartCount.innerText = totalItems;
        cartCount.classList.remove('hidden');
    } else {
        cartCount.classList.add('hidden');
    }

    if (cart.length === 0) {
        cartItems.innerHTML = `<p class="text-slate-500 text-center py-8">আপনার কার্টটি সম্পূর্ণ খালি।</p>`;
        cartTotal.innerText = "৳ ০";
        return;
    }

    cartItems.innerHTML = cart.map(item => `
        <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div class="flex items-center gap-3">
                <img src="${item.img}" class="w-12 h-12 rounded-lg object-cover">
                <div>
                    <h5 class="font-semibold text-sm">${item.name}</h5>
                    <span class="text-xs text-slate-500">৳${item.price} x ${item.quantity}</span>
                </div>
            </div>
            <button onclick="removeFromCart('${item._id}')" class="text-red-500 hover:text-red-700 transition text-sm"><i class="fas fa-trash-alt"></i></button>
        </div>
    `).join('');

    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotal.innerText = `৳ ${totalPrice}`;
}

function removeFromCart(productId) {
    cart = cart.filter(item => item._id !== productId);
    updateCartUI();
}

// ৪. 🚀 মূল অর্ডার সাবমিশন ইঞ্জিন (যা আপনার অ্যাডমিন ড্যাশবোর্ডে ডাটা পাঠাবে)
document.getElementById('quick-order-form')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    if (cart.length === 0) return alert('অর্ডার করার জন্য প্রথমে অন্তত ১টি প্রোডাক্ট কার্টে যোগ করুন!');

    // ফর্ম থেকে লাইভ কাস্টমার ইনফরমেশন সংগ্রহ করা
    const orderData = {
        customerName: document.getElementById('cust-name').value.trim(),
        customerPhone: document.getElementById('cust-phone').value.trim(),
        customerEmail: document.getElementById('cust-email').value.trim(),
        customerAddress: document.getElementById('cust-address').value.trim(), // এখানে কাস্টমার ঢাকা বা সিলেট লিখবে
        items: cart,
        totalAmount: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    };

    try {
        const response = await fetch('http://localhost:5000/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });

        const resData = await response.json();

        if (response.ok && resData.success) {
            alert(`🎉 ধন্যবাদ ${orderData.customerName}! আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে।`);
            
            // স্টেট ও ইউআই রিসেট করা
            cart = [];
            updateCartUI();
            this.reset();
            toggleCart();
            
            if (typeof fetchProducts === "function") fetchProducts(); // শপ পেজের লাইভ স্টক রিফ্রেশ করা
        } else {
            alert(`❌ অর্ডার সফল হয়নি: ${resData.error}`);
        }
    } catch (error) {
        console.error("Checkout Error:", error);
        alert('❌ ব্যাকএন্ড সার্ভারের সাথে যোগাযোগ করা সম্ভব হচ্ছে না!');
    }
});