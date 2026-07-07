import { openDB } from "./opendb.js";
import { showMessage } from "./showmsg.js";

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

async function updateQty(button, delta) {

    const pid = button.dataset.pid;
    const gender = button.dataset.gender;
    const key = `${gender}${pid}`;
    const db = await openDB(STORE_NAME, DB_NAME);
    const tx = db.transaction([STORE_NAME], "readwrite");
    const store = tx.objectStore(STORE_NAME);
    let item = await requestToPromise(store.get(key));

    if (!item) return;
    item.Qty += delta;
    if (item.Qty <= 0) {
        await requestToPromise(store.delete(key));

        button.textContent = "Add to Cart";
        button.onclick = () =>
            addToCart(button, pid, gender, item.price);
        return;
    }
    await requestToPromise(store.put(item));
    button.querySelector(".qty").textContent = item.Qty;
}