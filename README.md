# Les_Echos_test
# Technologies Utilisées
**Backend** : Nest.js, MongoDB

**Conteneurisation** : Docker

**Tests Unitaires** : Jest

**Documentation des APIs** : Swagger
# Installation et Utilisation
### Cloner le Répertoire
 Clonez le dépôt en utilisant la commande suivante :


`git clone <URL_DU_REPO>` 

`cd projectName`

#### Construire les Images Docker :

`
docker-compose build`

#### Lancer les Conteneurs :

`
docker-compose up`

#### Documentation des APIs
   La documentation des APIs est disponible via Swagger.
   Une fois l'application démarrée, accédez à la documentation à l'URL suivante http://localhost:3000/api-docs
#### Tests Unitaires
Les tests unitaires sont écrits avec Jest. Pour exécuter les tests, utilisez la commande suivante :

`npm run test`
