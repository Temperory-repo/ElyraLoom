function showMessage(message, isError = false) {
    const body = document.getElementById("message");
    if (!body) return;

    body.classList.remove("hidden");
    body.innerHTML = `
        <span class="flex ${isError ? "text-red-500" : "text-green-800"}">
            ${message}
        </span>
    `;

    setTimeout(() => {
        body.innerHTML = "";
        body.classList.add("hidden");
    }, 3000);
}

export {showMessage};