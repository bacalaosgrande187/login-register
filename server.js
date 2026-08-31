const express = require("express");
const path = require("path");
const Database = require("better-sqlite3");
const bcrypt = require("bcryptjs");

const app = express();
const PORT = 3000;

// =========================
// MIDDLEWARE
// =========================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));

// =========================
// DATABASE
// =========================

const db = new Database("database.sqlite");

db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
`);

console.log("Database SQLite connectée.");

// =========================
// REGISTER
// =========================

app.post("/api/register", async (req, res) => {

    try {

        const username = String(req.body.username || "").trim();
        const email = String(req.body.email || "").trim().toLowerCase();
        const password = String(req.body.password || "");

        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Tous les champs sont obligatoires."
            });
        }

        if (username.length < 3) {
            return res.status(400).json({
                success: false,
                message: "Le username doit avoir au moins 3 caractères."
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Le mot de passe doit avoir au moins 8 caractères."
            });
        }

        const existingUser = db.prepare(`
            SELECT id
            FROM users
            WHERE email = ? OR username = ?
        `).get(email, username);

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Email ou username déjà utilisé."
            });
        }

        const passwordHash = await bcrypt.hash(password, 12);

        const result = db.prepare(`
            INSERT INTO users (
                username,
                email,
                password_hash
            )
            VALUES (?, ?, ?)
        `).run(
            username,
            email,
            passwordHash
        );

        console.log(`Utilisateur créé : ${username}`);

        return res.status(201).json({
            success: true,
            message: "Compte créé avec succès.",
            userId: result.lastInsertRowid
        });

    } catch (error) {

        console.error("Register error:", error);

        return res.status(500).json({
            success: false,
            message: "Erreur interne du serveur."
        });
    }
});

// =========================
// LOGIN
// =========================

app.post("/api/login", async (req, res) => {

    try {

        const email = String(req.body.email || "").trim().toLowerCase();
        const password = String(req.body.password || "");

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email et mot de passe requis."
            });
        }

        const user = db.prepare(`
            SELECT id, username, email, password_hash
            FROM users
            WHERE email = ?
        `).get(email);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Email ou mot de passe incorrect."
            });
        }

        const passwordValid = await bcrypt.compare(
            password,
            user.password_hash
        );

        if (!passwordValid) {
            return res.status(401).json({
                success: false,
                message: "Email ou mot de passe incorrect."
            });
        }

        console.log(`Connexion réussie : ${user.username}`);

        return res.json({
            success: true,
            message: "Connexion réussie.",
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        });

    } catch (error) {

        console.error("Login error:", error);

        return res.status(500).json({
            success: false,
            message: "Erreur interne du serveur."
        });
    }
});

// =========================
// HOMEPAGE
// =========================

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "homepage.html"));
});

// =========================
// SERVER
// =========================

app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
});