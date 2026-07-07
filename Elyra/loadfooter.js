window.addEventListener("DOMContentLoaded", async () => {
    const footer = document.getElementById("footer");
    if (!footer) return;
    try {
        const logged = localStorage.getItem("loggedInUser");
        const response = await fetch("/templates/footer.html");
        if (!response.ok) {
            throw new Error("Failed to load footer");
        } 
        footer.innerHTML = await response.text();
        const quicklinks = document.getElementById("quicklinks");
        if (logged && quicklinks) {
            quicklinks.innerHTML += `
                <li><a href="/cart" class="hover:text-white">Cart</a></li>
                <li><a href="/WishList" class="hover:text-white">Wish List</a></li>
            `;
        }
    } catch (err) {
        console.error(err);
    }
});