import { openDB } from "./opendb.js";
import { addToCart } from "./addToCart.js";
import { showMessage } from "./showmsg.js";

let currentUserId = null;
let object = "wishlist";
let storeName = "wishList";

function getUserKey(id, gender) {
    return `${gender}${id}`;
}

async function syncWishlistHearts() {
    try {
        const db = await openDB(object,storeName);
        const tx = db.transaction([object], "readonly");
        const store = tx.objectStore(object);
        const request = store.getAll();

        request.onsuccess = function () {
            const wishlistItems = request.result || [];
            const wishlistKeys = new Set(wishlistItems.map(item => item.id));

            document.querySelectorAll('button[onclick*="wishList"]').forEach(btn => {
                const heart = btn.querySelector("span");
                if (!heart) return;

                const onclickStr = btn.getAttribute('onclick') || '';
                const match = onclickStr.match(/wishList\(this,\s*(\d+),\s*['"](.+?)['"]/);

                if (match) {
                    const productId = match[1];
                    const gender = match[2];
                    const key = `${gender}${productId}`;

                    if (wishlistKeys.has(key)) {
                        heart.classList.remove("text-white");
                        heart.classList.add("text-red-500");
                    } else {
                        heart.classList.remove("text-red-500");
                        heart.classList.add("text-white");
                    }
                }
            });
        };

    } catch (err) {
        console.error("Failed to sync wishlist hearts:", err);
    }
}
window.syncWishlistHearts = syncWishlistHearts;

async function syncCartButtons() {
    console.log("syncCartButtons called");  
    const db = await openDB("cart", "Cart");
    const tx = db.transaction(["cart"], "readonly");
    const store = tx.objectStore("cart");

    const cartItems = await new Promise((resolve, reject) => {
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });

    document.querySelectorAll(".addtocart").forEach(button => {
        const pid = button.dataset.pid;
        const gender = button.dataset.gender;
        const key = `${gender}${pid}`;
        const item = cartItems.find(cart => cart.id === key);
        if (item) {
            renderCartButton(button, item);
        }
    });
}
window.syncCartButtons = syncCartButtons;

function renderCartButton(button, item) {
    button.innerHTML = `
        <span class="remove px-1.5 cursor-pointer text-sm">-</span>
        <span class="qty px-1 font-semibold">${item.Qty}</span>
        <span class="add px-1.5 cursor-pointer text-sm">+</span>
    `;

    button.querySelector(".add").onclick = (e) => {
        e.stopPropagation();
        updateCartQty(button, 1);
    };

    button.querySelector(".remove").onclick = (e) => {
        e.stopPropagation();
        updateCartQty(button, -1);
    };
}

async function updateCartQty(button, delta) {
    const pid = button.dataset.pid;
    const gender = button.dataset.gender;
    const key = `${gender}${pid}`;

    try {
        const db = await openDB("cart", "Cart");
        const tx = db.transaction(["cart"], "readwrite");
        const store = tx.objectStore("cart");

        let item = await new Promise((resolve, reject) => {
            const req = store.get(key);
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
        });

        if (!item) return;

        item.Qty += delta;
        if (item.Qty <= 0) {
            await new Promise((resolve, reject) => {
                const req = store.delete(key);
                req.onsuccess = resolve;
                req.onerror = reject;
            });
            button.textContent = "Add to Cart";
            button.onclick = () => addToCart(button, pid, gender, item.price);
            return;
        }

        await new Promise((resolve, reject) => {
            const req = store.put(item);
            req.onsuccess = resolve;
            req.onerror = reject;
        });

        button.querySelector(".qty").textContent = item.Qty;
    } catch (err) {
        console.error(err);
    }
}

async function wishList(btnElement, productId, gender, price) {
    if (!btnElement || !productId || !gender) return;

    const key = getUserKey(productId, gender);
    const heart = btnElement.querySelector("span");
    if (!heart) return;

    try {
        const db = await openDB(object,storeName);
        const tx = db.transaction([object], "readwrite");
        const store = tx.objectStore(object);

        if (heart.classList.contains("text-red-500")) {
            heart.classList.remove("text-red-500");
            heart.classList.add("text-white");
            const req = store.delete(key);
            req.onsuccess = () => showMessage("Removed from wishlist!");
            req.onerror = () => showMessage("Failed to remove.", true);
        } else {
            heart.classList.remove("text-white");
            heart.classList.add("text-red-500");

            const req = store.add({
                id: key,
                productId: productId,
                gender: gender,
                price: Number(price) || 0,
                createdAt: new Date().toISOString()
            });

            req.onsuccess = () => showMessage("Added to wishlist!");
            req.onerror = () => showMessage("Item already in wishlist.", true);
        }
    } catch (err) {
        console.error("Wishlist DB error:", err);
        showMessage("Database error.", true);
    }
}
window.wishList = wishList;

function logged() {
    const islogged = localStorage.getItem("loggedInUser");
    if (!islogged) {
        return;
    }
    currentUserId = islogged;
    Check(islogged);
}

window.logged = logged;

async function Check(islogged) {
    if (!islogged) return;

    const wishContainer = document.getElementById("wishlistpage");
    if (!wishContainer) return;

    try {
        const db = await openDB(object,storeName);
        const tx = db.transaction([object], "readonly");
        const store = tx.objectStore(object);
        const request = store.getAll();

        request.onsuccess = function () {
            const wishlistItems = request.result || [];

            wishContainer.innerHTML = "";

            if (wishlistItems.length === 0) {
                wishContainer.innerHTML = `<h1 class="text-black text-lg font-bold m-8">Wishlist is Empty...</h1>`;
                return;
            }

            wishlistItems.forEach(item => {
                const productId = parseInt(item.id.replace(item.gender, ""), 10) || item.productId || 0;

                const cardHTML = `
                    <div class="group bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                        <div class="relative">
                            <img src="/static/collection/mix/${item.id}.webp" 
                                 class="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-500" 
                                 alt="Product ${item.id}">
                        </div>
                        <div class="p-5">
                            <div class="flex items-end justify-between">
                                <div>
                                    <span class="text-2xl font-md">₹${item.price}</span>
                                </div>
                                <div class="flex items-center gap-1">
                                    <button onclick="wishList(this, ${productId}, '${item.gender}', ${item.price})" 
                                            class="bg-transparent border-0 p-0 m-0 cursor-pointer text-2xl text-white appearance-none">
                                        <span class="[-webkit-text-stroke:2px_rgba(45,42,42,0.772)] text-4xl font-bold text-red-500">&#x2665;&#xFE0E;</span>
                                    </button>
                                    <button onclick="addToCart(this, ${productId}, '${item.gender}', ${item.price})" 
                                            data-pid="${productId}"
                                            data-gender="${item.gender}"
                                            data-price="${item.price}"
                                            class="addtocart cursor-pointer bg-black hover:bg-zinc-800 text-white text-sm font-medium px-1 py-1.5 rounded-xl transition">
                                        Add to Cart
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;

                wishContainer.innerHTML += cardHTML;
            });
        };

        request.onerror = () => showMessage("Failed to load wishlist.", true);

    } catch (error) {
        console.error("Wishlist load error:", error);
        showMessage("System error loading wishlist.", true);
    }
}
window.Check = Check;
window.addToCart = addToCart;
window.showMessage = showMessage;

window.addEventListener("DOMContentLoaded", () => {
    logged();
    syncWishlistHearts();  
    syncCartButtons();   
});