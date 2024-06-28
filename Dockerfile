# Utiliser une image de base Node.js officielle
FROM node:16.16.0

# Définir le répertoire de travail dans le conteneur
WORKDIR /app

# Copier les fichiers package.json et package-lock.json
COPY package*.json ./

# Installer les dépendances
RUN npm install --force
RUN npm i bcrypt --unsafe-perm=true --allow-root --save


# Copier le reste de l'application
COPY . .

# Exposer le port sur lequel l'application va tourner
EXPOSE 3003

# Définir la commande par défaut pour exécuter le serveur
CMD ["npm","run", "build"]
CMD ["npm","run", "start"]
