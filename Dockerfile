# Dockerfile

# Étape 1 : Utiliser une image de base Node.js légère
# Nous utilisons l'image 'alpine' pour une taille minimale.
FROM node:20-alpine

RUN apk add --no-cache tzdata
ENV TZ=Europe/Paris

# Définir le répertoire de travail dans le conteneur
WORKDIR /app

# Copier les fichiers de dépendances pour profiter du cache Docker
# Si package.json ne change pas, les dépendances ne sont pas réinstallées.
COPY package*.json ./

# Installer les dépendances
# L'option --production ignore les dépendances de développement, réduisant la taille.
RUN npm install --production

# Copier le reste du code de l'application
COPY . .

# Définir la commande pour lancer l'application
# Votre fichier d'entrée principal semble être app.js
CMD ["node", "app.js"]

# Si votre application Discord gère également des requêtes HTTP (ex: interactions Discord, webhooks, ou une API),
# vous devrez exposer le port qu'elle utilise (par exemple, 3000).
# Si c'est juste un bot qui se connecte via la librairie Discord.js, EXPOSE n'est pas strictement nécessaire.
# Si vous exposez un port, remplacez 3000 par le port réel de votre application.
# EXPOSE 3000
