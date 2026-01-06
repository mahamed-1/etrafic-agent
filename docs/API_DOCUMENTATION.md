# Documentation des APIs - Application eTraffic Agent

## 📋 Table des matières

1. [Configuration générale](#configuration-générale)
2. [Service d'authentification](#service-dauthentification)
3. [Service véhicules](#service-véhicules)
4. [Service violations](#service-violations)
5. [Service PV (Procès-Verbaux)](#service-pv-procès-verbaux)
6. [Service notifications](#service-notifications)
7. [Gestion des erreurs](#gestion-des-erreurs)
8. [Intercepteurs et middleware](#intercepteurs-et-middleware)

---

## 🔧 Configuration générale

### URL de base
```typescript
BASE_URL: 'https://evisav2.gouv.dj/etraffic-api/api/v1'
```

### Configuration
- **Timeout**: 15 secondes
- **Headers par défaut**: 
  - `Content-Type: application/json`
  - `Accept: application/json`
- **Cache**: 5 minutes
- **Authentication**: Bearer Token (JWT)

---

## 🔐 Service d'authentification

### 1. **POST** `/auth/login`
**Connexion utilisateur**

#### Paramètres
```typescript
{
  "identifier": "string", // Email ou nom d'utilisateur
  "password": "string"
}
```

#### Réponse succès
```typescript
{
  "access_token": "string",
  "refresh_token": "string",
  "user": {
    "id": "string",
    "email": "string",
    "name": "string",
    "role": "string"
  }
}
```

### 2. **POST** `/auth/refresh`
**Renouvellement du token**

#### Headers
```
Authorization: Bearer <refresh_token>
```

#### Réponse
```typescript
{
  "access_token": "string",
  "expires_in": number
}
```

### 3. **POST** `/auth/logout`
**Déconnexion utilisateur**

#### Headers
```
Authorization: Bearer <access_token>
```

### 4. **POST** `/auth/introspect`
**Vérification de la validité du token**

#### Headers
```
Authorization: Bearer <access_token>
```

#### Réponse
```typescript
{
  "active": boolean,
  "identifier": "string",
  "userId": "string",
  "role": "string",
  "issuedAt": "string",
  "expiryDate": "string",
  "tokenId": "string"
}
```

---

## 🚗 Service véhicules

### 1. **GET** `/vehicules/search-fetch?plaque={plaque}`
**Recherche et récupération des détails d'un véhicule**

#### Paramètres Query
- `plaque`: string (obligatoire) - Numéro de plaque d'immatriculation

#### Réponse succès
```typescript
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "plaque": "AB123CD",
  "registrationNumber": "AB123456",
  "chassisNumber": "WBAXH5C53CC918064",
  "engineNumber": "ENG12345678",
  "brand": "Toyota",
  "model": "Corolla",
  "color": "Blue",
  "manufactureYear": 2022,
  "fuelType": "Diesel",
  "vehicleType": "Sedan",
  "registrationDate": "2022-01-15",
  "status": "Active",
  "approvalStatus": "PENDING",
  "approvalDate": "2025-08-06T08:18:29.860Z",
  "approvedById": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "approvedByUsername": "string",
  "approvalComments": "string",
  "documents": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "Carte Grise",
      "description": "Vehicle registration certificate",
      "documentType": "REGISTRATION",
      "filePath": "/uploads/documents/carte_grise_123.pdf",
      "uploadedAt": "2023-05-15T14:30:00"
    }
  ],
  "ownerUserId": "123e4567-e89b-12d3-a456-426614174000",
  "ownerUsername": "john_doe",
  "ownerFullname": "John Doe",
  "ownerMail": "john.doe@email.com",
  "phoneNumber": "john_doe",
  "isUnassigned": false,
  "ownerPhoneNumber": "+25377012345",
  "ownerEmail": "mohammed.benali@email.dj",
  "ownerCin": "AB123456",
  "claimedById": "123e4567-e89b-12d3-a456-426614174000",
  "claimedByUsername": "john_doe",
  "claimedByFullname": "John Doe",
  "claimedByEmail": "john.doe@email.com",
  "claimedByPhoneNumber": "+25377012345",
  "claimedAt": "2025-08-06T08:18:29.860Z"
}
```

### 2. **GET** `/integration/verification/vehicle/{plaque}`
**Vérification des documents du véhicule**

#### Paramètres
- `plaque`: string - Numéro de plaque d'immatriculation

#### Réponse succès
```typescript
{
  "assuranceValide": boolean,
  "carteGriseValide": boolean,
  "permisValide": boolean,
  "message": "string" // Message optionnel
}
```

---

## ⚖️ Service violations

### 1. **GET** `/infractions?page={page}&per_page={per_page}&category={category}`
**Récupération des types d'infractions**

#### Paramètres Query
- `page`: number (défaut: 1)
- `per_page`: number (défaut: 20)  
- `category`: string (optionnel)

#### Réponse succès
```typescript
{
  "content": [
    {
      "id": "string",
      "type": "string",
      "description": "string",
      "lieu": "string",
      "gravite": "Mineure" | "Majeure" | "Grave",
      "montantAmande": number,
      "createdById": "string" | null,
      "createdAt": "string",
      "updatedAt": "string"
    }
  ],
  "pageable": {
    "pageNumber": number,
    "pageSize": number,
    "sort": {
      "sorted": boolean,
      "empty": boolean,
      "unsorted": boolean
    },
    "offset": number,
    "paged": boolean,
    "unpaged": boolean
  },
  "totalElements": number,
  "totalPages": number,
  "last": boolean,
  "size": number,
  "number": number,
  "numberOfElements": number,
  "first": boolean,
  "empty": boolean
}
```

---

## 📝 Service PV (Procès-Verbaux)

### 1. **POST** `/pvs?vehiclePlaque={plaque}&infractionIds[]={id}&documentDescriptions={desc}&location={location}`
**Création d'un procès-verbal**

#### Headers
```
Content-Type: multipart/form-data
Authorization: Bearer <access_token>
```

#### Paramètres Query
- `vehiclePlaque`: string (obligatoire) - Plaque du véhicule
- `infractionIds`: string[] (obligatoire) - IDs des infractions
- `documentDescriptions`: string (optionnel) - Descriptions des documents
- `location`: string (optionnel) - Localisation au format JSON

#### Body (FormData)
```typescript
FormData {
  documents: File[] // Photos/documents obligatoires
}
```

#### Exemple de location JSON
```typescript
{
  "latitude": number,
  "longitude": number,
  "address": "string",
  "city": "string",
  "country": "string",
  "region": "string",
  "street": "string",
  "postalCode": "string"
}
```

#### Réponse succès
```typescript
{
  "id": "string",
  "vehiclePlaque": "string",
  "infractionIds": ["string"],
  "createdAt": "string"
}
```

### 2. **GET** `/pvs/my-pvs-as-agent`
**Récupération des PV créés par l'agent connecté**

#### Headers
```
Authorization: Bearer <access_token>
```

#### Réponse succès
```typescript
[
  {
    "id": "string",
    "vehicule": {
      "plaque": "string",
      "registrationNumber": "string"
    },
    "infractions": [
      {
        "type": "string",
        "montantAmande": number
      }
    ],
    "createdAt": "string",
    "location": {
      "address": "string",
      "city": "string"
    }
  }
]
```

---

## 🔔 Service notifications

### 1. **GET** `/notifications/unread/count`
**Nombre de notifications non lues**

#### Headers
```
Authorization: Bearer <access_token>
```

#### Réponse succès
```typescript
{
  "count": number
}
```

### 2. **GET** `/notifications?filter={filter}&page={page}&limit={limit}`
**Liste des notifications**

#### Paramètres Query
- `filter`: "all" | "unread" | "read" (optionnel)
- `page`: number (défaut: 1)
- `limit`: number (défaut: 10)

#### Headers
```
Authorization: Bearer <access_token>
```

#### Réponse succès
```typescript
{
  "notifications": [
    {
      "id": "string",
      "title": "string",
      "message": "string",
      "type": "info" | "warning" | "error" | "success",
      "isRead": boolean,
      "createdAt": "string"
    }
  ],
  "total": number,
  "page": number,
  "hasMore": boolean
}
```

### 3. **PUT** `/notifications/{id}/read`
**Marquer une notification comme lue**

#### Paramètres
- `id`: string - ID de la notification

#### Headers
```
Authorization: Bearer <access_token>
```

---

## ⚠️ Gestion des erreurs

### Codes d'erreur HTTP standardisés

#### 400 - Bad Request
```typescript
{
  "message": "Données invalides",
  "errors": {
    "field": ["Error message"]
  }
}
```

#### 401 - Unauthorized
```typescript
{
  "message": "Token invalide ou expiré"
}
```

#### 403 - Forbidden
```typescript
{
  "message": "Accès refusé - permissions insuffisantes"
}
```

#### 404 - Not Found
```typescript
{
  "message": "Ressource non trouvée"
}
```

#### 500 - Internal Server Error
```typescript
{
  "message": "Erreur serveur interne"
}
```

---

## 🔄 Intercepteurs et middleware

### Request Interceptor
- **Ajout automatique** du token Authorization
- **Blocage des requêtes** si utilisateur déconnecté
- **Logs de développement** des requêtes sortantes

### Response Interceptor
- **Gestion automatique** du refresh token (401)
- **Queue des requêtes** pendant le refresh
- **Déconnexion automatique** en cas d'erreur 403
- **Logs d'erreurs** en développement

### Gestion du refresh token
```typescript
// Processus automatique lors d'un 401
1. Intercepter la réponse 401
2. Mettre les requêtes en queue
3. Appeler /auth/refresh
4. Réessayer les requêtes en échec
5. Si refresh échoue → déconnexion automatique
```

---

## 📊 Statistiques et métriques

### Données calculées côté client
- **Contrôles du jour**: Estimation basée sur les PV
- **Véhicules conformes**: Contrôles - Violations
- **Montant total**: Somme des amendes du jour
- **Informations de sync**: Basées sur les PV récents

---

## 🔒 Sécurité

### Authentication
- **JWT Tokens** avec expiration
- **Refresh token** automatique
- **Session validation** périodique (5 min)

### Stockage
- **AsyncStorage** pour les tokens
- **Cache sécurisé** des données sensibles
- **Nettoyage automatique** à la déconnexion

### Permissions
- **Vérification côté serveur** des permissions agent
- **Fallbacks gracieux** pour les erreurs 403
- **Logs sécurisés** sans données sensibles

---

## 🌐 URLs et environnements

### Production
```
https://evisav2.gouv.dj/etraffic-api/api/v1
```

### Développement (commentées)
```
http://192.168.100.150:9191/api/v1
http://192.168.100.47:9191/api/v1
```

---

## 📱 Utilisation dans l'application

### Authentification
1. Login → Stockage tokens
2. Auto-refresh → Transparent
3. Session expiry → Redirection login

### Contrôle véhicule
1. Scan/saisie plaque
2. Appel `search-fetch` + `verification`
3. Affichage données véhicule
4. Choix: Conforme ou Violation

### Création PV
1. Sélection infractions
2. Prise photos obligatoires
3. Géolocalisation automatique
4. Upload multipart/form-data
5. Confirmation succès

### Dashboard
1. Récupération PV agent
2. Calcul statistiques locales
3. Affichage notifications
4. Sync en temps réel

---

*Documentation générée le 6 août 2025*
*Version API: v1*
*Application: eTraffic Agent Mobile*
