# 🧠 Quiz It

Une application web interactive permettant aux étudiants en informatique de tester leurs connaissances à travers des quiz chronométrés et notés automatiquement.

## 🚀 Fonctionnalités

- 🔐 **Authentification** - Inscription et connexion sécurisées avec JWT
- 🧾 **Quiz chronométrés** - Questions à choix multiples avec limite de temps
- 🧮 **Calcul automatique du score** - Évaluation instantanée des réponses
- 📊 **Résultats détaillés** - Affichage des bonnes et mauvaises réponses
- 🕓 **Historique des quiz** - Suivi des scores, dates et sujets passés
- 💾 **Base de données MySQL** - Stockage sécurisé des utilisateurs et quiz

## 🛠️ Technologies utilisées

| Catégorie | Technologies |
|-----------|--------------|
| **Frontend** | HTML5, CSS3, JavaScript (Vanilla) |
| **Backend** | Node.js, Express.js |
| **Base de données** | MySQL |
| **Authentification** | JSON Web Tokens (JWT) |

## 📋 Prérequis

- Node.js (v14 ou supérieur)
- MySQL (v5.7 ou supérieur)
- Un navigateur web moderne
- Git

## ⚙️ Installation et exécution locale

### 1. Cloner le projet

```bash
git clone https://github.com/votre-username/quiz-it.git
cd quiz-it
```

### 2. Créer la base de données

\`\`\`bash
mysql -u root -p
\`\`\`

Puis exécutez :

\`\`\`sql
CREATE DATABASE quiz_system;
USE quiz_system;
\`\`\`

Importez le fichier de base de données :

\`\`\`bash
mysql -u root -p quiz_system < backend/database.sql
\`\`\`

### 3. Configurer les variables d'environnement

Dans le dossier `backend`, créez un fichier `.env` :

\`\`\`env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASS=votre_mot_de_passe
DB_NAME=quiz_system
JWT_SECRET=votre_secret_jwt_tres_securise
\`\`\`

### 4. Installer les dépendances backend

\`\`\`bash
cd backend
npm install
\`\`\`

### 5. Lancer le serveur

\`\`\`bash
npm start
\`\`\`


## 📸 Captures d'écran

### Connexion / Inscription
![Login Register](./screenshots/login-register.png)

### Dashboard des sujets
![Dashboard](./screenshots/dashboard.png)

### Quiz - Question correcte
![Quiz Correct](./screenshots/quiz-correct.png)

### Quiz - Question incorrecte
![Quiz Incorrect](./screenshots/quiz-incorrect.png)

### Résultats
![Results](./screenshots/results.png)

### Historique des quiz
![History](./screenshots/history.png)

---
