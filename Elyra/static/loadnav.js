function logout() {
    localStorage.setItem("loggedInUser", "");
    window.location.reload();
}

fetch("/templates/navbar.html")
    .then(res => res.text())
    .then(data => {
        document.getElementById("navbar").innerHTML = data;

        const accImg = document.getElementById("accimg");
        if (accImg) {
            accImg.src = "/static/guestacc.png";
        }
        function updateAccountUI(username) {
            const accImage = document.getElementById("accimage");
            if (!accImage) return;

            const firstChar = username[0].toUpperCase();

            accImage.innerHTML = `<span class="text-green-400 text-2xl">${firstChar}</span>`;
            accImage.classList.add("border-green-500");
        }

        function updateDropdown(isLoggedIn, username = "") {
            const menu = document.getElementById("dropdownMenu");
            if (!menu) return;

            if (isLoggedIn) {
                menu.innerHTML = `
                    <a class="px-4 py-2.5 text-left text-white hover:bg-gray-600 transition-colors block" href="/cart">Cart</a>
                    <a class="px-4 py-2.5 text-left text-white hover:bg-gray-600 transition-colors block" href="/WishList">WishList</a>
                    <button onclick="logout()" 
                            class="w-full text-left px-4 py-2.5 text-red-400 hover:bg-gray-600 transition-colors">
                        Logout
                    </button>
                `;
            } else {
                menu.innerHTML = `
                    <a class="px-4 py-2.5 text-left text-white hover:bg-gray-600 transition-colors block" href="/Sign Up">Sign Up</a>
                    <a class="px-4 py-2.5 text-left text-white hover:bg-gray-600 transition-colors block" href="/Login">Sign In</a>
                `;
            }
        }

        function checkLoggedInUser() {
            const loggedUser = localStorage.getItem("loggedInUser");
            
            if (loggedUser) {
                updateAccountUI(loggedUser);
                updateDropdown(true, loggedUser);
            } else {
                updateDropdown(false);
            }
        }
        checkLoggedInUser();

        // Hover on desktop (via CSS md:group-hover:flex), click on mobile
        const accImageEl = document.getElementById("accimage");
        const menuEl = document.getElementById("dropdownMenu");
        const isMobile = () => window.matchMedia("(max-width: 767px)").matches;
        if (accImageEl && menuEl) {
            accImageEl.addEventListener("click", (e) => {
                if (!isMobile()) return;
                e.stopPropagation();
                menuEl.classList.toggle("hidden");
                menuEl.classList.toggle("flex");
            });
            document.addEventListener("click", (e) => {
                if (!isMobile()) return;
                if (!menuEl.contains(e.target) && !accImageEl.contains(e.target)) {
                    menuEl.classList.add("hidden");
                    menuEl.classList.remove("flex");
                }
            });
            // Reset inline state when crossing breakpoint so desktop hover works
            window.addEventListener("resize", () => {
                if (!isMobile()) {
                    menuEl.classList.add("hidden");
                    menuEl.classList.remove("flex");
                }
            });
        }
    });
