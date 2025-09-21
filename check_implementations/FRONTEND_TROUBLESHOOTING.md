# 🔧 GUIDE DE DÉPANNAGE FRONTEND - SANTÉAFRIK

## 🚨 Erreurs Courantes et Solutions

### 1. Erreurs d'Authentification

#### ❌ Erreur 401 - Unauthorized
```json
{
  "message": "Token d'accès requis"
}
```

**Causes possibles :**
- Token manquant dans les headers
- Token expiré
- Token malformé

**Solutions :**
```typescript
// Vérifier que le token est présent
const token = await AsyncStorage.getItem('token');
if (!token) {
  // Rediriger vers la page de connexion
  navigation.navigate('Login');
  return;
}

// Ajouter le token aux headers
const headers = {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
};
```

#### ❌ Erreur 400 - Bad Request
```json
{
  "error": "Champ(s) manquant(s)",
  "missingFields": ["motdepasse"]
}
```

**Causes possibles :**
- Champs manquants dans le body
- Format de données incorrect
- Validation échouée

**Solutions :**
```typescript
// Vérifier tous les champs requis
const loginData = {
  email: email.trim(),
  motdepasse: password // Attention au nom du champ !
};

// Pour l'inscription patient
const patientData = {
  nom: nom.trim(),
  prenom: prenom.trim(),
  email: email.trim(),
  motDePasse: password, // Attention au nom du champ !
  telephone: telephone.trim(),
  dateNaissance: dateNaissance,
  genre: genre,
  adresse: adresse.trim(),
  groupeSanguin: groupeSanguin,
  poids: parseFloat(poids),
  taille: parseFloat(taille)
};
```

### 2. Erreurs de Profil

#### ❌ Erreur 404 - Profil non trouvé
```json
{
  "message": "Patient introuvable"
}
```

**Solutions :**
```typescript
// Vérifier que l'utilisateur est bien connecté
const user = await AsyncStorage.getItem('user');
if (!user) {
  navigation.navigate('Login');
  return;
}

// Utiliser le bon endpoint selon le rôle
const endpoint = user.role === 'PATIENT' 
  ? '/patients/me' 
  : '/medecins/me';
```

#### ❌ Erreur 400 - Validation échouée
```json
{
  "message": "Données invalides",
  "errors": [
    {
      "field": "email",
      "message": "Format d'email invalide"
    }
  ]
}
```

**Solutions :**
```typescript
// Valider les données avant envoi
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePhone = (phone) => {
  const phoneRegex = /^\+228\d{8}$/;
  return phoneRegex.test(phone);
};

// Valider avant l'envoi
if (!validateEmail(email)) {
  Alert.alert('Erreur', 'Format d\'email invalide');
  return;
}
```

### 3. Erreurs de Recherche

#### ❌ Erreur 401 - Recherche non autorisée
```json
{
  "message": "Token d'accès requis"
}
```

**Solutions :**
```typescript
// S'assurer que l'utilisateur est authentifié
const searchDoctors = async (query) => {
  const token = await AsyncStorage.getItem('token');
  if (!token) {
    navigation.navigate('Login');
    return;
  }

  try {
    const response = await apiService.searchDoctors({
      q: query,
      limit: 20,
      offset: 0
    });
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      // Token expiré, rediriger vers login
      await AsyncStorage.removeItem('token');
      navigation.navigate('Login');
    }
    throw error;
  }
};
```

### 4. Erreurs de Rendez-vous

#### ❌ Erreur 400 - Données RDV invalides
```json
{
  "message": "Données de rendez-vous invalides"
}
```

**Solutions :**
```typescript
// Vérifier tous les champs requis pour un RDV
const createAppointment = async (appointmentData) => {
  // Validation des champs requis
  const requiredFields = ['patient_id', 'medecin_id', 'dateheure', 'duree', 'motif', 'type_rdv'];
  const missingFields = requiredFields.filter(field => !appointmentData[field]);
  
  if (missingFields.length > 0) {
    Alert.alert('Erreur', `Champs manquants: ${missingFields.join(', ')}`);
    return;
  }

  // Validation du format de date
  const appointmentDate = new Date(appointmentData.dateheure);
  if (isNaN(appointmentDate.getTime())) {
    Alert.alert('Erreur', 'Format de date invalide');
    return;
  }

  // Validation de la durée
  if (appointmentData.duree <= 0 || appointmentData.duree > 480) {
    Alert.alert('Erreur', 'Durée invalide (entre 1 et 480 minutes)');
    return;
  }

  try {
    const response = await apiService.createAppointment(appointmentData);
    return response.data;
  } catch (error) {
    console.error('Erreur création RDV:', error);
    throw error;
  }
};
```

### 5. Erreurs de Messagerie

#### ❌ Erreur 403 - Communication non autorisée
```json
{
  "message": "Communication non autorisée entre ces utilisateurs"
}
```

**Causes possibles :**
- Patient et médecin n'ont pas de relation (pas de RDV commun)
- Règles de communication non respectées

**Solutions :**
```typescript
// Vérifier la relation avant de créer une conversation
const checkCommunicationRules = async (medecinId) => {
  try {
    // Essayer de créer la conversation
    const response = await apiService.createPrivateConversation(medecinId);
    return response.data;
  } catch (error) {
    if (error.response?.status === 403) {
      Alert.alert(
        'Communication non autorisée',
        'Vous devez avoir un rendez-vous avec ce médecin pour pouvoir communiquer.'
      );
      return null;
    }
    throw error;
  }
};
```

### 6. Erreurs de Dossier Médical

#### ❌ Erreur 404 - Dossier non trouvé
```json
{
  "message": "Dossier médical non trouvé"
}
```

**Solutions :**
```typescript
// Créer le dossier s'il n'existe pas
const getOrCreateMedicalRecord = async () => {
  try {
    const response = await apiService.getMedicalRecord();
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      // Le dossier sera créé automatiquement par le serveur
      // Réessayer après un court délai
      await new Promise(resolve => setTimeout(resolve, 1000));
      const retryResponse = await apiService.getMedicalRecord();
      return retryResponse.data;
    }
    throw error;
  }
};
```

### 7. Erreurs de Notifications

#### ❌ Erreur 400 - Device invalide
```json
{
  "message": "Token de device invalide"
}
```

**Solutions :**
```typescript
// Vérifier le format du token Expo
const registerDevice = async () => {
  try {
    const token = await Notifications.getExpoPushTokenAsync();
    
    // Vérifier le format du token
    if (!token.startsWith('ExponentPushToken[')) {
      throw new Error('Format de token invalide');
    }

    const response = await apiService.registerDevice({
      token: token,
      platform: Platform.OS,
      version: Constants.expoConfig?.version || '1.0.0'
    });
    
    return response.data;
  } catch (error) {
    console.error('Erreur enregistrement device:', error);
    throw error;
  }
};
```

## 🛠️ Service API Robuste

```typescript
class RobustApiService {
  private baseURL = 'http://localhost:3000/api';
  private token: string | null = null;

  async setToken(token: string) {
    this.token = token;
    await AsyncStorage.setItem('token', token);
  }

  private async getHeaders() {
    const token = await AsyncStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  private async handleResponse(response: Response) {
    if (!response.ok) {
      if (response.status === 401) {
        // Token expiré, nettoyer et rediriger
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('user');
        // Rediriger vers login (à implémenter selon votre navigation)
        throw new Error('TOKEN_EXPIRED');
      }
      
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erreur serveur');
    }
    
    return response.json();
  }

  async request(method: string, endpoint: string, data?: any) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method,
        headers: await this.getHeaders(),
        body: data ? JSON.stringify(data) : undefined
      });
      
      return await this.handleResponse(response);
    } catch (error) {
      if (error.message === 'TOKEN_EXPIRED') {
        // Gérer la redirection vers login
        throw error;
      }
      
      console.error(`Erreur API ${method} ${endpoint}:`, error);
      throw error;
    }
  }

  // Méthodes spécifiques
  async login(email: string, password: string) {
    return this.request('POST', '/auth/login', { email, motdepasse: password });
  }

  async getProfile() {
    const user = await AsyncStorage.getItem('user');
    const endpoint = user?.role === 'PATIENT' ? '/patients/me' : '/medecins/me';
    return this.request('GET', endpoint);
  }

  async updateProfile(data: any) {
    const user = await AsyncStorage.getItem('user');
    const endpoint = user?.role === 'PATIENT' ? '/patients/me' : '/medecins/me';
    return this.request('PUT', endpoint, data);
  }

  async searchDoctors(params: any) {
    const queryString = new URLSearchParams(params).toString();
    return this.request('GET', `/specialites/medecins/search?${queryString}`);
  }

  async createAppointment(data: any) {
    return this.request('POST', '/rendezvous', data);
  }

  async createConversation(participantId: string) {
    return this.request('POST', '/messagerie/conversations/private', { participantId });
  }

  async sendMessage(conversationId: string, contenu: string) {
    return this.request('POST', '/messagerie/messages', {
      conversationId,
      contenu,
      type: 'TEXTE'
    });
  }
}

export const apiService = new RobustApiService();
```

## 📱 Gestion des Erreurs dans les Composants

```typescript
// Hook pour gérer les erreurs API
const useApiError = () => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleApiCall = async (apiCall: () => Promise<any>) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiCall();
      return result;
    } catch (err: any) {
      if (err.message === 'TOKEN_EXPIRED') {
        // Rediriger vers login
        navigation.navigate('Login');
        return;
      }
      
      setError(err.message || 'Une erreur est survenue');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { error, loading, handleApiCall };
};

// Utilisation dans un composant
const ProfileScreen = () => {
  const { error, loading, handleApiCall } = useApiError();
  const [profile, setProfile] = useState(null);

  const loadProfile = async () => {
    try {
      const result = await handleApiCall(() => apiService.getProfile());
      setProfile(result.data);
    } catch (err) {
      // Erreur déjà gérée par le hook
    }
  };

  return (
    <View>
      {error && <Text style={styles.error}>{error}</Text>}
      {loading && <ActivityIndicator />}
      {/* Reste du composant */}
    </View>
  );
};
```

## 🎯 Checklist de Débogage

### ✅ Vérifications de Base
- [ ] Token présent dans AsyncStorage
- [ ] Headers Authorization corrects
- [ ] URL de l'API correcte
- [ ] Format des données conforme

### ✅ Vérifications Spécifiques
- [ ] Champs requis présents
- [ ] Types de données corrects
- [ ] Validation côté client
- [ ] Gestion des erreurs

### ✅ Tests Recommandés
- [ ] Test avec token valide
- [ ] Test avec token expiré
- [ ] Test avec données manquantes
- [ ] Test avec données invalides

**Ce guide couvre toutes les erreurs courantes et leurs solutions !** 🚀
