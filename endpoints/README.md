# 📚 Documentation API - Système de Rendez-vous Médicaux

## 🎯 Vue d'ensemble

Cette API REST permet la gestion complète d'un système de rendez-vous médicaux avec les fonctionnalités suivantes :

- **Authentification** : Inscription, connexion, validation OTP
- **Gestion des utilisateurs** : Patients, Médecins, Administrateurs
- **Rendez-vous** : Création, confirmation, annulation, gestion des créneaux
- **Ordonnances** : Création, gestion des lignes de médicaments
- **Notifications** : Préférences, devices push, envoi de notifications
- **Messagerie** : Conversations, messages, fichiers joints

## 📋 Endpoints disponibles

### 🔐 Authentification
- [**auth-endpoints.md**](./auth-endpoints.md) - Inscription, connexion, validation OTP, gestion des rôles

### 👥 Utilisateurs
- [**patient-endpoints.md**](./patient-endpoints.md) - Gestion des patients
- [**medecin-endpoints.md**](./medecin-endpoints.md) - Gestion des médecins
- [**cabinet-endpoints.md**](./cabinet-endpoints.md) - Gestion des cabinets médicaux

### 📅 Rendez-vous
- [**rendezvous-endpoints.md**](./rendezvous-endpoints.md) - Création, gestion des RDV, créneaux, agendas

### 💊 Ordonnances
- [**ordonnances-endpoints.md**](./ordonnances-endpoints.md) - Création, gestion des ordonnances et lignes de médicaments

### 🔔 Notifications
- [**notification-preferences-endpoints.md**](./notification-preferences-endpoints.md) - Préférences et devices push

### 💬 Messagerie
- [**messagerie-endpoints.md**](./messagerie-endpoints.md) - Conversations, messages, fichiers

### 🏥 Dossier médical
- [**dossier-medical-endpoints.md**](./dossier-medical-endpoints.md) - Gestion du dossier médical

## 🚀 Base URLs

### API Principale
```
http://localhost:3000/api
```

### API Mobile
```
http://localhost:3000/api/v1/mobile
```

### API Dashboard
```
http://localhost:3000/api/v1/dashboard
```

## 🔑 Authentification

Tous les endpoints (sauf inscription/connexion) nécessitent un token JWT :

```http
Authorization: Bearer <your-jwt-token>
```

## 📊 Codes de statut HTTP

- **200** : Succès
- **201** : Créé avec succès
- **204** : Pas de contenu
- **400** : Requête invalide
- **401** : Non authentifié
- **403** : Accès refusé
- **404** : Ressource non trouvée
- **409** : Conflit (ex: email déjà utilisé)
- **422** : Données non traitables
- **500** : Erreur serveur

## 🧪 Tests

Tous les endpoints ont été testés et validés :

- ✅ **Ordonnances** : 8/8 tests passent
- ✅ **Rendez-vous** : 6/6 tests passent  
- ✅ **Notifications** : 9/9 tests passent

## 📝 Format des réponses

### Succès
```json
{
  "message": "Description de l'action",
  "data": { /* Données retournées */ }
}
```

### Erreur
```json
{
  "error": "Description de l'erreur",
  "message": "Message détaillé",
  "details": "Informations supplémentaires"
}
```

## 🔄 Pagination

Pour les endpoints de liste, utilisez les paramètres de requête :

```http
GET /api/endpoint?page=1&limit=10&sort=date&order=desc
```

## 📱 Support mobile

L'API est optimisée pour les applications mobiles avec :
- Endpoints dédiés `/api/v1/mobile/`
- Gestion des tokens push
- Upload de fichiers
- Notifications en temps réel

## 🛠️ Développement

### Installation
```bash
npm install
```

### Démarrage
```bash
npm start
```

### Tests
```bash
npm test
```

### Base de données
```bash
# Initialisation
npm run db:init

# Migration
npm run db:migrate
```

## 📞 Support

Pour toute question ou problème :
- Consultez la documentation spécifique de chaque endpoint
- Vérifiez les codes d'erreur HTTP
- Utilisez les exemples fournis dans chaque fichier de documentation

---

**Dernière mise à jour** : Janvier 2025  
**Version API** : v1.0.0