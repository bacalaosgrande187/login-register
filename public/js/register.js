const registerForm = document.getElementById("registerForm");
const message = document.getElementById("message");

registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    message.textContent = "";

    if (password !== confirmPassword) {
        message.textContent = "Les mots de passe ne correspondent pas.";
        return;
    }

    try {
        const response = await fetch("/api/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username,
                email,
                password
            })
        });

        const data = await response.json();

        message.textContent = data.message;

        if (data.success) {
            registerForm.reset();
        }

    } catch (error) {
        console.error(error);
        message.textContent = "Impossible de contacter le serveur.";
    }
});