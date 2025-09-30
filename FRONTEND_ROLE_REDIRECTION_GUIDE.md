# Guide Frontend - Gestion des Rôles et Redirection

## 🔐 Problème Résolu

Le backend renvoie maintenant le **rôle** dans la réponse de login. Utilisez ce rôle pour rediriger l'utilisateur vers la bonne interface.

## 📋 Rôles Disponibles

- `PATIENT` → Interface patient
- `MEDECIN` → Interface médecin  
- `ADMINCABINET` → Interface admin cabinet
- `SUPERADMIN` → Interface super admin

## 🚀 Implémentation Frontend

### 1. Service API - Login

```typescript
// api/auth.ts
export const login = async (email: string, password: string) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, motdepasse: password })
  });
  
  const data = await response.json();
  
  if (data.success) {
    return {
      user: data.data.user,
      token: data.data.token,
      refreshToken: data.data.refreshToken,
      role: data.data.role, // ✅ NOUVEAU : Rôle disponible
      mustChangePassword: data.data.mustChangePassword
    };
  }
  
  throw new Error(data.message);
};
```

### 2. Context/Store - Gestion d'État

```typescript
// context/AuthContext.tsx
interface AuthState {
  user: User | null;
  token: string | null;
  role: string | null; // ✅ NOUVEAU
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthState>({
  user: null,
  token: null,
  role: null,
  isAuthenticated: false
});

export const AuthProvider = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    role: null,
    isAuthenticated: false
  });

  const login = async (email: string, password: string) => {
    try {
      const result = await api.login(email, password);
      
      setState({
        user: result.user,
        token: result.token,
        role: result.role, // ✅ Stocker le rôle
        isAuthenticated: true
      });
      
      // ✅ Redirection automatique selon le rôle
      redirectByRole(result.role);
      
    } catch (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ ...state, login }}>
      {children}
    </AuthContext.Provider>
  );
};
```

### 3. Fonction de Redirection

```typescript
// utils/navigation.ts
export const redirectByRole = (role: string) => {
  switch (role) {
    case 'PATIENT':
      // Rediriger vers l'interface patient
      window.location.href = '/patient/dashboard';
      // Ou avec React Router :
      // navigate('/patient/dashboard');
      break;
      
    case 'MEDECIN':
      // Rediriger vers l'interface médecin
      window.location.href = '/medecin/dashboard';
      // Ou avec React Router :
      // navigate('/medecin/dashboard');
      break;
      
    case 'ADMINCABINET':
      // Rediriger vers l'interface admin cabinet
      window.location.href = '/admin/dashboard';
      break;
      
    case 'SUPERADMIN':
      // Rediriger vers l'interface super admin
      window.location.href = '/superadmin/dashboard';
      break;
      
    default:
      console.error('Rôle inconnu:', role);
      // Rediriger vers une page d'erreur ou de sélection
      window.location.href = '/role-selection';
  }
};
```

### 4. Composant Login

```typescript
// components/Login.tsx
const Login = () => {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (email: string, password: string) => {
    setLoading(true);
    try {
      await login(email, password);
      // ✅ La redirection se fait automatiquement dans le context
    } catch (error) {
      alert('Erreur de connexion: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Formulaire de login */}
    </form>
  );
};
```

### 5. Protection des Routes

```typescript
// components/ProtectedRoute.tsx
interface ProtectedRouteProps {
  allowedRoles: string[];
  children: React.ReactNode;
}

const ProtectedRoute = ({ allowedRoles, children }: ProtectedRouteProps) => {
  const { role, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (!allowedRoles.includes(role!)) {
    return <Navigate to="/unauthorized" />;
  }

  return <>{children}</>;
};

// Utilisation
<Route 
  path="/medecin/*" 
  element={
    <ProtectedRoute allowedRoles={['MEDECIN']}>
      <MedecinLayout />
    </ProtectedRoute>
  } 
/>

<Route 
  path="/patient/*" 
  element={
    <ProtectedRoute allowedRoles={['PATIENT']}>
      <PatientLayout />
    </ProtectedRoute>
  } 
/>
```

### 6. Debug Panel (Optionnel)

```typescript
// components/DebugPanel.tsx
const DebugPanel = () => {
  const { user, role, isAuthenticated } = useAuth();

  return (
    <div style={{ position: 'fixed', top: 0, right: 0, background: 'white', padding: '10px', border: '1px solid #ccc' }}>
      <h4>Debug Panel</h4>
      <p>Authentifié: {isAuthenticated ? 'Oui' : 'Non'}</p>
      {user && (
        <>
          <p>ID: {user.idutilisateur}</p>
          <p>Email: {user.email}</p>
          <p>Nom: {user.nom}</p>
          <p>Rôle: {role}</p> {/* ✅ Afficher le rôle */}
        </>
      )}
    </div>
  );
};
```

## 🎯 Structure des Routes Recommandée

```
/ (public)
├── /login
├── /register
├── /patient (protected - PATIENT)
│   ├── /dashboard
│   ├── /rendez-vous
│   ├── /dossier-medical
│   └── /messagerie
├── /medecin (protected - MEDECIN)
│   ├── /dashboard
│   ├── /agenda
│   ├── /patients
│   └── /consultations
├── /admin (protected - ADMINCABINET)
│   ├── /dashboard
│   ├── /medecins
│   └── /statistiques
└── /superadmin (protected - SUPERADMIN)
    ├── /dashboard
    ├── /cabinets
    └── /validation
```

## ✅ Test de la Solution

1. **Login Patient** → Redirection vers `/patient/dashboard`
2. **Login Médecin** → Redirection vers `/medecin/dashboard`
3. **Login Admin** → Redirection vers `/admin/dashboard`
4. **Login SuperAdmin** → Redirection vers `/superadmin/dashboard`

## 🔧 Variables d'Environnement

```env
# Frontend
REACT_APP_API_URL=http://localhost:3000
REACT_APP_ENV=development
```

## 📱 Exemple Complet - React Router

```typescript
// App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Routes publiques */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Routes protégées par rôle */}
          <Route 
            path="/patient/*" 
            element={
              <ProtectedRoute allowedRoles={['PATIENT']}>
                <PatientApp />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/medecin/*" 
            element={
              <ProtectedRoute allowedRoles={['MEDECIN']}>
                <MedecinApp />
              </ProtectedRoute>
            } 
          />
          
          {/* Redirection par défaut */}
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
```

## 🚨 Points d'Attention

1. **Token Storage** : Stockez le token de manière sécurisée (httpOnly cookies recommandé)
2. **Refresh Token** : Implémentez le refresh automatique
3. **Logout** : Nettoyez tous les états lors de la déconnexion
4. **Fallback** : Gérez les rôles inconnus ou manquants
5. **SEO** : Utilisez des meta tags appropriés pour chaque interface

## 🎉 Résultat

Avec cette implémentation, après login :
- ✅ Le rôle est disponible dans le state
- ✅ Redirection automatique vers la bonne interface
- ✅ Protection des routes par rôle
- ✅ Debug panel affiche le rôle correctement
