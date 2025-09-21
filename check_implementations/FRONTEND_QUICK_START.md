# 🚀 DÉMARRAGE RAPIDE FRONTEND - SANTÉAFRIK

## 📋 Script d'Initialisation

### 1. Créer le projet Expo
```bash
# Créer un nouveau projet Expo
npx create-expo-app SanteAfrikFrontend --template blank-typescript

# Naviguer dans le dossier
cd SanteAfrikFrontend

# Installer les dépendances principales
npm install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs
npm install react-native-screens react-native-safe-area-context
npm install @reduxjs/toolkit react-redux
npm install axios socket.io-client
npm install @expo/vector-icons expo-notifications
npm install expo-document-picker expo-image-picker
npm install @react-native-async-storage/async-storage
npm install expo-constants expo-linking

# Installer les dépendances de développement
npm install --save-dev @types/react @types/react-native
```

### 2. Structure des dossiers
```bash
# Créer la structure recommandée
mkdir -p src/{components,screens,services,navigation,store,utils,types}
mkdir -p src/components/{common,forms}
mkdir -p src/screens/{auth,patient,doctor,shared}
mkdir -p assets/{images,icons}
```

### 3. Configuration initiale

#### app.json
```json
{
  "expo": {
    "name": "SantéAfrik",
    "slug": "santeafrik",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "assetBundlePatterns": ["**/*"],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.santeafrik.app"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#FFFFFF"
      },
      "package": "com.santeafrik.app",
      "permissions": [
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE"
      ]
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png",
          "color": "#ffffff"
        }
      ]
    ],
    "extra": {
      "eas": {
        "projectId": "your-project-id-here"
      }
    }
  }
}
```

### 4. Services de base

#### src/services/apiService.ts
```typescript
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://localhost:3000/api';

class ApiService {
  private token: string | null = null;

  constructor() {
    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Intercepteur pour ajouter le token automatiquement
    axios.interceptors.request.use(async (config) => {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Intercepteur pour gérer les erreurs
    axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          await AsyncStorage.removeItem('token');
          // Rediriger vers la page de connexion
        }
        return Promise.reject(error);
      }
    );
  }

  // Authentification
  async login(email: string, password: string) {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email,
      password
    });
    await AsyncStorage.setItem('token', response.data.token);
    return response.data;
  }

  async sendOTP(telephone: string) {
    return axios.post(`${API_BASE_URL}/auth/send-otp`, { telephone });
  }

  async verifyOTP(telephone: string, code: string) {
    return axios.post(`${API_BASE_URL}/auth/verify-otp`, { telephone, code });
  }

  // Recherche de médecins
  async searchDoctors(params: any) {
    return axios.get(`${API_BASE_URL}/specialites/medecins/search`, { params });
  }

  async getSpecialties() {
    return axios.get(`${API_BASE_URL}/specialites/specialites`);
  }

  // Rendez-vous
  async createAppointment(data: any) {
    return axios.post(`${API_BASE_URL}/rendezvous`, data);
  }

  async getPatientAppointments(patientId: string) {
    return axios.get(`${API_BASE_URL}/rendezvous/patient/${patientId}`);
  }

  async getTodayAppointments() {
    return axios.get(`${API_BASE_URL}/rendezvous/aujourd-hui`);
  }

  async getWaitingPatients() {
    return axios.get(`${API_BASE_URL}/rendezvous/en-attente-consultation`);
  }

  // Messagerie
  async createPrivateConversation(participantId: string) {
    return axios.post(`${API_BASE_URL}/messagerie/conversations/private`, {
      participantId
    });
  }

  async getConversations() {
    return axios.get(`${API_BASE_URL}/messagerie/conversations`);
  }

  async sendMessage(data: any) {
    return axios.post(`${API_BASE_URL}/messagerie/messages`, data);
  }

  async getMessages(conversationId: string) {
    return axios.get(`${API_BASE_URL}/messagerie/conversations/${conversationId}/messages`);
  }

  // Dossier médical
  async getMedicalRecord() {
    return axios.get(`${API_BASE_URL}/dossier-medical/dossier/me`);
  }

  async uploadDocument(data: FormData) {
    return axios.post(`${API_BASE_URL}/dossier-medical/documents`, data, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }
}

export const apiService = new ApiService();
```

#### src/services/socketService.ts
```typescript
import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

class SocketService {
  private socket: Socket | null = null;

  async connect() {
    const token = await AsyncStorage.getItem('token');
    if (!token) return;

    this.socket = io('http://localhost:3000', {
      auth: { token }
    });

    this.socket.on('connect', () => {
      console.log('Connecté au serveur Socket.IO');
    });

    this.socket.on('disconnect', () => {
      console.log('Déconnecté du serveur Socket.IO');
    });
  }

  onNewMessage(callback: (message: any) => void) {
    this.socket?.on('new_message', callback);
  }

  onConsultationUpdate(callback: (data: any) => void) {
    this.socket?.on('consultation:started', callback);
    this.socket?.on('consultation:ended', callback);
    this.socket?.on('patient:arrived', callback);
  }

  disconnect() {
    this.socket?.disconnect();
  }
}

export const socketService = new SocketService();
```

### 5. Navigation de base

#### src/navigation/AppNavigator.tsx
```typescript
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import PatientDashboardScreen from '../screens/patient/PatientDashboardScreen';
import DoctorDashboardScreen from '../screens/doctor/DoctorDashboardScreen';
import SearchDoctorsScreen from '../screens/patient/SearchDoctorsScreen';
import ConversationsScreen from '../screens/shared/ConversationsScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const PatientTabs = () => (
  <Tab.Navigator>
    <Tab.Screen 
      name="Dashboard" 
      component={PatientDashboardScreen}
      options={{
        tabBarIcon: ({ color, size }) => (
          <Ionicons name="home" size={size} color={color} />
        )
      }}
    />
    <Tab.Screen 
      name="Recherche" 
      component={SearchDoctorsScreen}
      options={{
        tabBarIcon: ({ color, size }) => (
          <Ionicons name="search" size={size} color={color} />
        )
      }}
    />
    <Tab.Screen 
      name="Messages" 
      component={ConversationsScreen}
      options={{
        tabBarIcon: ({ color, size }) => (
          <Ionicons name="chatbubbles" size={size} color={color} />
        )
      }}
    />
  </Tab.Navigator>
);

const DoctorTabs = () => (
  <Tab.Navigator>
    <Tab.Screen 
      name="Dashboard" 
      component={DoctorDashboardScreen}
      options={{
        tabBarIcon: ({ color, size }) => (
          <Ionicons name="medical" size={size} color={color} />
        )
      }}
    />
    <Tab.Screen 
      name="Agenda" 
      component={DoctorDashboardScreen}
      options={{
        tabBarIcon: ({ color, size }) => (
          <Ionicons name="calendar" size={size} color={color} />
        )
      }}
    />
    <Tab.Screen 
      name="Messages" 
      component={ConversationsScreen}
      options={{
        tabBarIcon: ({ color, size }) => (
          <Ionicons name="chatbubbles" size={size} color={color} />
        )
      }}
    />
  </Tab.Navigator>
);

export default function AppNavigator() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        // Vérifier la validité du token et récupérer les infos utilisateur
        // setUser(userData);
      }
    } catch (error) {
      console.error('Erreur vérification auth:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : (
          <>
            {user.role === 'PATIENT' ? (
              <Stack.Screen name="PatientApp" component={PatientTabs} />
            ) : (
              <Stack.Screen name="DoctorApp" component={DoctorTabs} />
            )}
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

### 6. Écrans de base

#### src/screens/auth/LoginScreen.tsx
```typescript
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert
} from 'react-native';
import { apiService } from '../../services/apiService';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    try {
      const response = await apiService.login(email, password);
      // Navigation sera gérée par AppNavigator
      navigation.navigate('PatientApp'); // ou DoctorApp selon le rôle
    } catch (error) {
      Alert.alert('Erreur', 'Identifiants incorrects');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SantéAfrik</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Mot de passe"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      
      <TouchableOpacity
        style={styles.button}
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Connexion...' : 'Se connecter'}
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.linkButton}
        onPress={() => navigation.navigate('Register')}
      >
        <Text style={styles.linkText}>Créer un compte</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5'
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 40,
    color: '#2c3e50'
  },
  input: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd'
  },
  button: {
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16
  },
  linkButton: {
    padding: 10
  },
  linkText: {
    color: '#3498db',
    textAlign: 'center',
    fontSize: 16
  }
});
```

### 7. Script de démarrage

#### package.json
```json
{
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web",
    "build:android": "eas build --platform android",
    "build:ios": "eas build --platform ios"
  }
}
```

### 8. Commandes de démarrage

```bash
# Démarrer le serveur de développement
npm start

# Démarrer sur Android
npm run android

# Démarrer sur iOS
npm run ios

# Démarrer sur Web
npm run web
```

## 🎯 Prochaines étapes

1. **Créer les écrans manquants** selon le guide complet
2. **Implémenter la gestion d'état** avec Redux Toolkit
3. **Ajouter les notifications push**
4. **Tester l'intégration** avec le backend
5. **Déployer** avec EAS Build

Ce script te donne une base solide pour démarrer rapidement le développement frontend ! 🚀
