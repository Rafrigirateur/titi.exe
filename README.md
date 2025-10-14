# Titi.exe - Bot Discord

Un bot Discord simple développé en Node.js, utilisant les **commandes Slash** et une base de données **SQLite** pour gérer un système de score et des messages personnalisés. Le bot est centré autour de la commande `/perdu` (heure miroir) qui incrémente le score de l'utilisateur.

## ✨ Fonctionnalités

* **Système de Score `/perdu`** :
    * Les utilisateurs gagnent un point lorsqu'ils exécutent la commande `/perdu` à une heure miroir (heure égale à la minute, ex: 12h12).
    * Un seul point peut être réclamé par minute.
    * Affiche des messages d'insulte ou de positivité aléatoires en fonction du succès (récupérés depuis la base de données).
* **Classement `/leaderboard`** : Affiche le top des joueurs.
* **Suggestion de Messages `/suggestion`** : Permet aux utilisateurs de suggérer de nouveaux messages pour les catégories `insultes`, `positivitee` ou `citations`, avec confirmation par bouton.
* **Gestion des Scores (Dev-Only) `/setscore`** : Commande réservée au développeur pour modifier manuellement le score d'un utilisateur.
* **Base de Données SQLite** :
    * Gère les scores des utilisateurs (`scores`).
    * Stocke l'historique des changements de score (`score_logs`).
    * Stocke les messages personnalisés pour les réponses du bot (`messages`).
* **Logging des Scores** : Le fichier `show_logs.js` permet d'afficher l'historique des modifications de score via la console.

## 🛠️ Configuration et Démarrage

Ce projet nécessite **Node.js** et un bot **Discord** configuré.

### Prérequis

* Node.js (vérifiez votre version)
* Un token de bot Discord (nécessite d'activer les privilèges/intents nécessaires si vous utilisez des messages/interactions spécifiques)
* L'ID de votre application Discord

### Installation

1.  **Cloner le dépôt** :
    ```bash
    git clone <URL_DU_DEPOT>
    cd titi-exe-bot
    ```

2.  **Installer les dépendances** :
    ```bash
    npm install
    ```
    *(Vérifiez votre `package.json` pour la commande exacte si besoin, mais `npm install` est la base)*

3.  **Fichier d'environnement (`.env`)** :
    Créez un fichier `.env` à la racine du projet et ajoutez vos variables :

    ```env
    # Token de votre bot Discord
    DISCORD_TOKEN=<VOTRE_TOKEN_BOT>
    # Votre clé publique d'application Discord (pour la vérification des interactions)
    PUBLIC_KEY=<VOTRE_CLE_PUBLIQUE>
    # L'ID de votre application Discord
    APP_ID=<VOTRE_APP_ID>
    # L'ID Discord du développeur (pour la commande /setscore)
    DEV_ID=519556904452751392 # Remplacez par votre propre ID si vous le souhaitez
    # Port d'écoute pour le serveur Express
    PORT=7778
    ```

### Lancement

1.  **Initialiser la Base de Données et les Commandes** :
    La première fois, vous devez enregistrer les commandes Slash et initialiser la base de données.
    * Les commandes sont enregistrées via `commands.js` :
        ```bash
        node commands.js
        ```
    * L'initialisation de la BDD se fait automatiquement au lancement de `app.js` grâce à `initDB()` qui crée les tables `scores`, `score_logs`, et `messages` si elles n'existent pas.

2.  **Démarrer le Bot** :
    ```bash
    node app.js
    ```
    Le bot écoute sur le port défini dans le fichier `.env` ou sur le port 7778.

## 🤖 Commandes Slash

| Commande | Description | Options |
| :--- | :--- | :--- |
| `/perdu` | À utiliser sur une heure miroir (ex: 12h12) pour gagner un point. | - |
| `/leaderboard` | Affiche le classement des meilleurs joueurs. | `user` (optionnel) : Utilisateur spécifique. |
| `/suggestion` | Suggérer un nouveau message pour le bot. | `type` (obligatoire) : `insultes`, `positivitee`, `citations`.<br>`message` (obligatoire) : Le contenu du message. |
| `/setscore` | **[DEV ONLY]** Modifie le score d'un utilisateur. | `user` (obligatoire) : Utilisateur à modifier.<br>`value` (obligatoire) : Le nouveau score. |

## 📁 Structure du Projet

* `app.js` : Point d'entrée principal, gère les interactions Discord (PONG, commandes Slash, boutons).
* `commands.js` : Définit et enregistre les commandes Slash globales auprès de l'API Discord.
* `database.js` : Gère la connexion et les requêtes à la base de données SQLite (`perdu.db`), incluant la gestion des scores, des logs et des messages.
* `utils.js` : Fonctions utilitaires, notamment pour les requêtes à l'API Discord (`DiscordRequest`), les messages aléatoires et la capitalisation.
* `show_logs.js` : Script pour afficher l'historique des scores enregistrés dans `score_logs`.
* `edit.js` : Exemple de script pour exécuter une requête SQL manuelle (ici, une mise à jour sur les messages).
