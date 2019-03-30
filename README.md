![Logo PayPixPlace](https://github.com/HE-Arc/PayPixPlace/blob/master/PayPixPlace/paypixplaceapp/static/paypixplaceapp/images/logoPPP.png)

## Informations sur le projet
Projet web Django 2019  
Application qui permet à plusieur personnes de remplir des pixels de couleur sur des canvas communautaires.  
Les fonctionnalités principales sont :
* Créer un canvas de tailles allant de 10x10 à 100x100 pixels.
* Colorier les Pixels de ce canvas à l'aide de l'éditeur fourni (limite à un par minute et système de munitions).
* Acheter des Pix à l'aide de l'API [Stripe](https://stripe.com/ch).
* Dépenser ces Pix dans la boutique pour acheter :
  * Plus de couleurs
  * Plus de munitions
  * Réduire le temps entre les placement de pixels
  * Bloquer certains pixels pendant une certaine durée

Tous les canvas sont modifiables librement par les utilisateur connectés. Les utilisateurs non-connectés peuvent uniquement visualiser les canvas.

## Informations pour le déploiement
### Mise en place du virtual env
Exécuter la première fois dans le répertoire de base de projet.  
`python -m venv env --clear`

### Activer le virtual env
Exécuter à chaque fois anvant de lancer le serveur.  
`source env/Scripts/activate`

### Desactiver le virtual env
`deactivate`

### Mettre à jour pip et installer les dépendances
`python -m pip install --upgrade pip`  
`python -m pip install -r requirements.txt`
