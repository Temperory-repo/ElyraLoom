function isloggedIn() {
    return localStorage.getItem("loggedInUser");
}

function check() {
    const user = localStorage.getItem("loggedInUser");

    if (!user) {
        document.getElementById("msg").classList.remove("hidden");
        return false;
    }

    return true;
}

function closeMsg() {
    document.getElementById("msg").classList.add("hidden");
}