![Erya](https://raw.githubusercontent.com/PapillonApp/Erya/refs/heads/main/.github/erya_banner_black.png)

# À propos d'Erya
> Erya est le nouvel assistant intelligent du Discord de Papillon, doté d'IA pour t'accompagner et enrichir tes échanges !
> Tu peux contribuer à son développement via ce repository, où toutes les instructions sont disponibles.

## 1 - Créer un serveur Discord pour son développement

**Étape 1 -** Créer un serveur  
**Étape 2 -** Invite le bot [Xenon](https://xenon.bot/invite) sur ce serveur (celui-ci va créer les rôles, les salons ainsi que les catégories nécéssaires au bon développement)  
**Étape 3 -** Éxécute la commande ``/backup load backup_id: WOWK5VM2COT1`` dans ce serveur  


## 2 - Créer une application sur Discord

**Étape 1 -** Rend-toi sur [Discord Developer](https://discord.com/developers/applications)  
**Étape 2 -** Clique sur "New Application"  
**Étape 3 -** Appelle la "**Erya Dev**"  
**Étape 4 -** Rends-toi dans la catégorie **Bot**  
**Étape 5 -** Active **Presence Intent**, **Server Members Intent**, **Message Content Intent**  
**Étape 6 -** Rends-toi dans la catégorie **OAuth2**  
**Étape 7 -** Dans **OAuth2 URL Generator**, coche **bot** ainsi que **applications.commands**  
**Étape 8 -** Dans **Bot permissions**, coche **Administrator**  
**Étape 9 -** Copie-colle le lien que Discord t'a généré dans ton navigateur, puis ajoute le au serveur **Erya Dev Server**  


## 3 - Cloner ce répository GitHub
```bash
git clone https://github.com/PapillonApp/Erya.git
```
```bash
cd Erya
```
```bash
npm install
```


## 4 - Configurer le bot

**Étape 1 -** Rend-toi dans le fichier ``.env.example``  
**Étape 2 -** Créer un fichier ``.env`` à la racine du projet  
**Étape 3 -** Copie-colle le contenu de ``.env.example`` dans le ``.env`` que tu viens de créer  
**Étape 4 -** Remplace dans le fichier ``.env`` toutes les valeurs par les tiennes : Token du bot, ID du serveur, des rôles, des catégories et des salons (**⚠️ NE PAS FAIRE CECI DANS LE .ENV.EXAMPLE**)


## 5 - Lancer le bot en mode développement
Le bot redémarrera automatiquement à chaque fois que tu sauvegardes un fichier !

```bash
npm run dev
```
