![Logo PayPixPlace](https://github.com/HE-Arc/PayPixPlace/blob/master/PayPixPlace/paypixplaceapp/static/paypixplaceapp/images/logoPPP.png)

## Informations sur le projet

Projet web Django 2019  
Application qui permet à plusieur personnes de remplir des pixels de couleur sur des canvas communautaires.  
Les fonctionnalités principales sont :

- Créer un canvas de tailles allant de 10x10 à 100x100 pixels.
- Colorier les Pixels de ce canvas à l'aide de l'éditeur fourni (limite à un par minute et système de munitions).
- Acheter des Pix à l'aide de l'API [Stripe](https://stripe.com/ch).
- Dépenser ces Pix dans la boutique pour acheter :
  - Plus de couleurs
  - Plus de munitions
  - Réduire le temps entre les placement de pixels
  - Bloquer certains pixels pendant une certaine durée

Tous les canvas sont modifiables librement par les utilisateur connectés. Les utilisateurs non-connectés peuvent uniquement visualiser les canvas.

## Mise en place du projet locallement

**WARNING** Ce projet se fait relativement vieux et n'est pas maintenu activement, il y a donc certaines choses à savoir.

La procédure d'installation a été testée dans l'environement suivant, les bibliothèques ne sont plus disponible dans les nouvelles versions de pip. Il faut donc idéalement avoir le même environement ou adapter mettre à jour les bibliothèques et/ou adapter certaines des commandes à exécutées.

- Windows 11
- Python 3.8.10
- pip 21.1.1

```
python --version
pip --version

python -m venv .venv
source .venv/Scripts/activate

pip install -r requirements.txt

cd paypixplace
python manage.py migrate
python manage.py runserver
```
