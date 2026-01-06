# 🚗 Vehicle Management Mobile App

Une application mobile développée avec React Native et Expo pour la gestion et le contrôle des véhicules.

## 📱 Fonctionnalités

- **Authentification** : Connexion sécurisée avec gestion des tokens JWT
- **Scan de véhicules** : Utilisation de la caméra pour scanner les informations des véhicules
- **Gestion des infractions** : Création et suivi des infractions de stationnement
- **Profil utilisateur** : Gestion des informations personnelles
- **Mode hors ligne** : Synchronisation automatique des données
- **Géolocalisation** : Suivi de la position pour les contrôles

## 🛠️ Technologies utilisées

- **React Native** avec Expo
- **TypeScript** pour un code plus robuste
- **Expo Router** pour la navigation
- **AsyncStorage** pour le stockage local
- **Axios** pour les appels API
- **React Native Reanimated** pour les animations
- **Expo Camera** pour la fonctionnalité de scan

## 📋 Prérequis

- Node.js (version 18 ou supérieure)
- npm ou yarn
- Expo CLI : `npm install -g @expo/cli`
- Un appareil mobile ou un émulateur

## 🚀 Installation

1. **Cloner le projet**
   ```bash
   git clone <url-du-repo>
   cd project
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configuration de l'environnement**
   ```bash
   cp .env.example .env
   ```
   Puis modifier le fichier `.env` avec vos configurations API.

4. **Lancer l'application**
   ```bash
   npm run dev
   ```

## 📱 Développement

### Structure du projet

```
app/                 # Pages de l'application (Expo Router)
components/          # Composants réutilisables
screens/            # Écrans de l'application
services/           # Services API et logique métier
contexts/           # Contextes React
hooks/              # Hooks personnalisés
utils/              # Utilitaires
types/              # Définitions TypeScript
constants/          # Constantes de l'application
styles/             # Styles et thème
```

### Scripts disponibles

- `npm run dev` : Lance le serveur de développement Expo
- `npm run build:web` : Build pour le web
- `npm run lint` : Vérification du code avec ESLint

## 🔧 Configuration

### Variables d'environnement

Créer un fichier `.env` à la racine avec :

```env
API_BASE_URL=https://your-api.com
API_TIMEOUT=10000
```

## 📖 API

L'application communique avec une API REST pour :
- Authentification des utilisateurs
- Gestion des véhicules
- Création et gestion des infractions
- Synchronisation des données

## 🤝 Contribution

1. Fork le projet
2. Créer une branche pour votre fonctionnalité (`git checkout -b feature/AmazingFeature`)
3. Commit vos modifications (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence privée.
