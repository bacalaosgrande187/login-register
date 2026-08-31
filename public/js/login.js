const loginForm = document.getElementById("loginForm");
const message = document.getElementById("message");

loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    // Vérification simple
    if (!email || !password) {
        message.textContent = "Veuillez remplir tous les champs.";
        return;
    }

    try {
        const response = await fetch("/api/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        const data = await response.json();

        if (!response.ok) {
            message.textContent = data.message;
            return;
        }

        console.log("Login réussi :", data.user);

        // Sauvegarder les informations de l'utilisateur
        localStorage.setItem("user", JSON.stringify(data.user));

        message.textContent = "Connexion réussie !";

        // Redirection
        setTimeout(() => {
            window.location.href = "/wallet.html";
        }, 500);

    } catch (error) {
        console.error("Login error:", error);
        message.textContent = "Impossible de contacter le serveur.";
    }
});
