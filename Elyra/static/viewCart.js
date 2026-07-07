import { openDB } from "./opendb.js";

const DB_NAME = "Cart";
const STORE_NAME = "cart";

function requestToPromise(request) {
    return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

export async function addToCart(button, pid, gender, price) {

    button.dataset.pid = pid;
    button.dataset.gender = gender;

    const key = `${gender}${pid}`;

    try {
        const db = await openDB(STORE_NAME, DB_NAME);
        const tx = db.transaction([STORE_NAME], "readwrite");
        const store = tx.objectStore(STORE_NAME);

        let item = await requestToPromise(store.get(key));

        if (!item) {
            item = {
                id: key,
                productId: Number(pid),
                gender,
                price: Number(price),
                Qty: 1,
                createdAt: new Date().toISOString()
            };
            await requestToPromise(store.add(item));

        } else {
            item.Qty++;
            await requestToPromise(store.put(item));
        }
        renderButton(button, item);

    } catch (err) {
        console.error(err);
    }
}       

export async function viewItems() {
    const container = document.getElementById("items");

    if (!container) return;
    try {
        const db = await openDB(STORE_NAME, DB_NAME);
        const tx = db.transaction([STORE_NAME], "readonly");
        const store = tx.objectStore(STORE_NAME);
        const items = await requestToPromise(store.getAll());
        container.innerHTML = "";
        if (items.length === 0) {
            container.innerHTML = `
                <h2 class="text-xl font-semibold">
                    Cart is Empty
                </h2>
            `;
            return;
        }
        let total = 0;
        items.forEach(item => {
            total += item.price * item.Qty;
            container.innerHTML += `
                <div class="flex justify-between items-center border-b py-4">
                    <div>
                        <img
                            src="/static/collection/mix/${item.id}.webp"
                            class="w-24 rounded-lg"
                        >
                    </div>
                    <div class="flex-1 ml-5">
                        <h2 class="font-semibold">
                            Product ${item.productId}
                        </h2>
                        <p>₹${item.price}</p>
                        <p>Quantity : ${item.Qty}</p>
                    </div>
                    <div class="font-bold">
                        ₹${item.price * item.Qty}
                    </div>
                </div>  
            `;
        });

        container.innerHTML += `
            <div class="text-right mt-5 text-2xl font-bold">
                Total : ₹${total}
            </div>
        `;

    } catch (err) {
        console.error(err);
    }
}

function renderButton(button, item) {

    button.innerHTML = `
        <span class="remove px-2 cursor-pointer">−</span>
        <span class="qty px-3">${item.Qty}</span>
        <span class="add px-2 cursor-pointer">+</span>
    `;

    button.querySelector(".add").onclick = e => {
        e.stopPropagation();
        updateQty(button, 1);
    };

    button.querySelector(".remove").onclick = e => {
        e.stopPropagation();
        updateQty(button, -1);
    };
}
