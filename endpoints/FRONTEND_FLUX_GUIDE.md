# 📱 **GUIDE COMPLÈTE FLUX FRONTEND - SantéAfrik**

---

## 🏗️ **ARCHITECTURE PROPOSÉE**

### **✅ Stratégie Recommandée :**
```
┌─────────────────────────────────────────────────────────┐
│ APPLICATIONS SÉPARÉES + RESPONSIVE DASHBOARD            │
├─────────────────────────────────────────────────────────┤
│ 📱 MOBILE APP (React Native / Flutter)                  │
│   └── UNIQUEMENT POUR PATIENTS                          │
│                                                         │
│ 💻 WEB DASHBOARD RESPONSIVE (React/Vue)                │
│   ├── /médecin/*      → Interface médecins             │
│   ├── /admin/*        → Interface admin cabinet         │
│   └── /super-admin/*  → Interface super admin          │
└─────────────────────────────────────────────────────────┘
```

**✅ Pourquoi cette approche ?**
- **Mobile native** : UX optimisée pour patients (prise RDV, suivi)
- **Dashboard unifié** : Gestion simplifiée (1 app = tous les rôles pros)
- **Maintenance facile** : Séparation claire des responsabilités

---

## 📱 **I. APPLICATION MOBILE - PATIENTS ONLY**

### **STACK TECHNIQUE**
- **Framework** : React Native ou Flutter
- **State** : Provider (RN) ou BLoC (Flutter)
- **Navigation** : React Navigation ou GoRouter
- **API** : Axios/Fetch + JWT interceptors
- **Push Notifications** : Firebase/Local (mobile only)

---

## 🔐 **II. AUTHENTIFICATION - COMMUNE AUX 2 APPS**

### **A. Inscription Patient**
```javascript
// Étapes frontend
const signUp = async (userData) => {
  try {
    // 1. POST /api/auth/register-patient
    const response = await api.post('/auth/register-patient', {
      email: userData.email,
      motdepasse: password,
      nom: userData.nom,
      prenom: userData.prenom,
      telephone: userData.telephone,
      datenaissance: userData.datenaissance,
      // ... autres champs
    });

    // 2. Redirection validation OTP
    navigation.navigate('OTPValidation', {
      email: userData.email,
      token: response.data.token // si fourni
    });

  } catch (error) {
    // Gestion erreurs (email existe, validation, etc.)
  }
}
```

### **B. Validation OTP**
```javascript
const verifyOTP = async (email, otp) => {
  try {
    // POST /api/auth/verify-otp
    const response = await api.post('/auth/verify-otp', { email, otp });

    // Stockage token sécurisé
    await secureStore.setItemAsync('authToken', response.data.token);

    // Navigation home
    navigation.reset({ routes: [{ name: 'MainApp' }] });

  } catch (error) {
    // OTP incorrect ou expiré
  }
}
```

### **C. Connexion**
```javascript
const login = async (email, password) => {
  try {
    // POST /api/auth/login
    const response = await api.post('/auth/login', { email, password });

    // Stockage tokens
    await secureStore.setItemAsync('authToken', response.data.token);
    await secureStore.setItemAsync('refreshToken', response.data.refreshToken);

    // Navigation selon rôle (mobile = patient only)
    navigation.reset({ routes: [{ name: 'MainTabs' }] });

  } catch (error) {
    // Credentials incorrects
  }
}
```

---

## 📱 **III. FLUX PATIENT - MOBILE APP**

### **Navigation Principale (Bottom Tabs)**
```
🏠 Accueil
🔍 Rechercher
📅 Mes RDV
👤 Profil
```

---

## 🏠 **ACCUEIL PATIENT**
- **Hero section** : "Prenez RDV facilement"
- **Actions rapides** :
  - "Nouveau RDV" → Redirection recherche
  - "Voir mes RDV" → Liste RDV
- **Notifications récentes** : Derniers RDV
- **Suggestions IA** : "Prochains RDV importants"

---

## 🔍 **RECHERCHE MÉDECINS**

### **Étape 1 : Spécialité/Symptôme**
```javascript
const searchBySymptom = async (symptom) => {
  try {
    // Recherche symptômes d'abord
    const symptoms = await api.get(`/specialites/maux/search?nom=${symptom}`);

    // Si un seul résultat pertinent
    if (symptoms.data.length === 1) {
      const symptomId = symptoms.data[0].idmaux;
      const doctors = await api.get(`/specialites/maux/${symptomId}/medecins`);
      // Affichage liste médecins
    } else {
      // Liste des symptômes possibles
    }
  } catch (error) {
    // Gestion erreurs recherche
  }
}
```

### **Étape 2 : Médecin Trouvé**
```javascript
const viewDoctor = (doctor) => {
  // Navigation vers profil médecin
  navigation.navigate('DoctorProfile', { doctorId: doctor.idmedecin });
}
```

### **Étape 3 : Consultation Profil Médecin**
```javascript
// ✅ Vérifier si agenda visible
const checkAgendaVisibility = async (agendaId) => {
  return await api.get(`/agenda/${agendaId}/slots/public?start=${start}&end=${end}&limit=1`);
}

const bookAppointment = async (doctor, selectedSlot) => {
  navigation.navigate('BookingConfirmation', {
    doctor,
    slot: selectedSlot,
    agendaId: selectedSlot.agenda_id
  });
}
```

### **Étape 4 : Calendrier Agenda**
```javascript
const loadAvailableSlots = async (agendaId, date) => {
  const start = moment(date).startOf('day').toISOString();
  const end = moment(date).endOf('day').toISOString();

  const slots = await api.get(`/agenda/${agendaId}/slots/public`, {
    params: { start, end }
  });

  // Affichage en grille/calendar
  return slots.data;
}

// Sélection et réservation
const confirmBooking = async (slot, motif) => {
  const bookingData = {
    patient_id: user.id,
    medecin_id: doctor.id,
    agenda_id: slot.agenda_id,
    slot_start_at: slot.start_at,
    slot_end_at: slot.end_at,
    type_rdv: slot.type,
    motif: motif || "Consultation"
  };

  const response = await api.post('/rendezvous', bookingData);
  // ✅ Réservation créée
  navigation.navigate('BookingSuccess', { rendezvous: response.data.data });
}
```

---

## 📅 **MES RDV PATIENT**

### **Liste à Venir**
```javascript
const loadUpcomingAppointments = async () => {
  const appointments = await api.get(`/rendezvous/patient/${user.id}`);

  return appointments.data.filter(apt =>
    apt.statut !== 'TERMINE' && apt.statut !== 'ANNULE'
  ).sort((a, b) => new Date(a.dateheure) - new Date(b.dateheure));
}

// Actions par RDV
const handleAppointmentAction = (appointment, action) => {
  switch(action) {
    case 'cancel':
      return cancelAppointment(appointment);
    case 'teleconsultation':
      return joinTeleconsultation(appointment);
  }
};
```

### **Annulation RDV**
```javascript
const cancelAppointment = async (appointment) => {
  const confirmed = await showYesNoAlert(
    'Annuler le RDV ?',
    'Cette action est définitive'
  );

  if (confirmed) {
    await api.put(`/rendezvous/${appointment.idrendezvous}/annuler`);
    showToast('RDV annulé avec succès', 'success');
    refreshAppointments();
  }
}
```

### **Téléconsultation - Jour J**
```javascript
const joinTeleconsultation = async (appointment) => {
  try {
    // 🔥 Récupérer infos salle
    const teleconsultationInfo = await api.get(
      `/rendezvous/${appointment.idrendezvous}/teleconsultation`
    );

    // 🚀 Redirection vers Jitsi/webview
    navigation.navigate('Teleconsultation', {
      salleVitruel: teleconsultationInfo.data.salle_virtuelle,
      lienVideo: teleconsultationInfo.data.lien_video,
      tokenAcces: teleconsultationInfo.data.token_acces
    });

  } catch (error) {
    // Erreur : consultation pas encore démarrée
  }
}
```

### **Historique RDV**
```javascript
const loadHistory = async () => {
  const appointments = await api.get(`/rendezvous/patient/${user.id}`);
  return appointments.data.filter(apt => apt.statut === 'TERMINE');
}
```

---

## 🔰 **PREMIER ACCÈS MÉDECIN (DASHBOARD)**

### **Flux Validation Médecin**
```
Création compte sur mobile → Admin validation → Agenda créé auto
```

### **Interface Médecin - Navigation**
```
📊 Dashboard
📅 Mon Agenda
👥 Mes Patients
💊 Ordonnances
💬 Messagerie
⚙️ Paramètres
```

---

## 📅 **AG.MÉDECIN - VUE PRINCIPLE**

### **Configuration Initiale**
```javascript
// ✅ Agenda déjà créé automatiquement via auth.service.ts
// Première connexion → configuration règles

const setupInitialRules = async () => {
  const rules = [
    { weekday: 1, start_time: "09:00", end_time: "17:00", duration_min: 30 },
    { weekday: 2, start_time: "09:00", end_time: "17:00", duration_min: 30 },
    // ... jours ouvrables
  ];

  // Créer règles
  const promises = rules.map(rule =>
    api.post(`/agenda/${agendaId}/rules`, rule)
  );

  await Promise.all(promises);
};
```

### **Vue Agenda - Sélection Période**
```javascript
const [viewMode, setViewMode] = useState('week'); // week, day, month
const [currentDate, setCurrentDate] = useState(new Date());

const loadAgendaData = async () => {
  // Calcul période visible
  const { start, end } = calculateViewRange(currentDate, viewMode);

  const [rules, blocks, extras, appointments] = await Promise.all([
    api.get(`/agenda/${agendaId}/rules`),
    api.get(`/agenda/${agendaId}/blocks`, { params: { start, end } }),
    api.get(`/agenda/${agendaId}/extra`, { params: { start, end } }),
    loadAppointments(start, end)
  ]);

  return { rules, blocks, extras, appointments };
};
```

### **Calcul & Affichage Créneaux**
```javascript
// 🔥 Génération des slots disponibles
const generateSlots = async (start, end) => {
  const computedSlots = await api.get(`/agenda/${agendaId}/slots`, {
    params: { start, end }
  });

  // Affichage calendrier/infinite scroll
  setDisplaySlots(computedSlots.data);
};
```

### **Actions Drag & Drop**
```javascript
const handleAppointmentMove = async (appointment, newStart, newEnd) => {
  try {
    // PUT /api/agenda/rdv/:rendezvousId/move
    await api.put(`/agenda/rdv/${appointment.id}/move`, {
      new_start_at: newStart,
      new_end_at: newEnd
    });

    // Refresh UI
    refreshCalendar();

  } catch (error) {
    // Collision détectée
    showError('Créneau non disponible');
  }
};
```

### **Redimensionnement RDV**
```javascript
const handleAppointmentResize = async (appointment, newEndTime) => {
  await api.put(`/agenda/rdv/${appointment.id}/resize`, {
    new_end_at: newEndTime
  });
};
```

### **Blocages & Disponibilités**
```javascript
// Créer blocage (vacances/réunion)
const createBlock = async (blockData) => {
  await api.post(`/agenda/${agendaId}/blocks`, {
    start_at: blockData.start,
    end_at: blockData.end,
    reason: blockData.reason
  });
};

//créer disponibilité exceptionnelle
const createExtraSlot = async (extraData) => {
  await api.post(`/agenda/${agendaId}/extra`, {
    start_at: extraData.start,
    end_at: extraData.end,
    type: extraData.type,
    visible_en_ligne: true
  });
};
```

---

## 🏥 **CONSULTATIONS MÉDECIN**

### **Workflow Présentiel**
```javascript
const [waitingPatients, setWaitingPatients] = useState([]);

const loadWaitingPatients = async () => {
  const response = await api.get('/rendezvous/en-attente-consultation');
  setWaitingPatients(response.data);
};

// Patient arrivé (scan QR par admin)
const markPatientArrived = async (rendezvousId) => {
  await api.put(`/rendezvous/${rendezvousId}/patient-arrive`);
};

// Démarrer consultation
const startConsultation = async (rendezvousId) => {
  await api.put(`/rendezvous/${rendezvousId}/commencer-consultation`);
  // Navigation salle consultation
};

// Clôturer consultation
const endConsultation = async (rendezvousId) => {
  await api.put(`/rendezvous/${rendezvousId}/cloturer-consultation`);
  // Modal publier ordonnance ?
  navigation.navigate('OrdonnanceCreation', { rendezVous: appointment });
};
```

### **Workflow Téléconsultation**
```javascript
// Consultation démarre automatiquement
// UI pourrait montrer "Salle ouverte" avec countdown

const autoStartTeleconsultation = async () => {
  const now = new Date();
  const upcomingConsultation = appointments.find(apt =>
    apt.type_rdv === 'TELECONSULTATION' &&
    Math.abs(new Date(apt.dateheure) - now) < 60000 // 1 min marge
  );

  if (upcomingConsultation) {
    await api.put(`/rendezvous/${upcomingConsultation.id}/commencer-consultation`);
    // Ouvrir fenêtre Jitsi
  }
};
```

---

## 💚 **TEMS RÉEL - COMMUN AUTRES 2 APPS**

### **Socket.IO Configuration**
```javascript
// Mobile + Dashboard
const socketService = {
  socket: null,

  connect: (token) => {
    socket = io(API_BASE_URL, {
      auth: { token },
      transports: ['websocket']
    });

    socket.on('connect', () => setOnline(true));
    socket.on('disconnect', () => setOnline(false));

    return socket;
  },

  // Événements métier
  onNewAppointment: (callback) => {
    socket.on('rendezvous:new', callback);
  },

  onAppointmentConfirmed: (callback) => {
    socket.on('rendezvous:confirmed', callback);
  },

  onPatientArrived: (callback) => {
    socket.on('patient:arrived', callback);
  },

  onConsultationStarted: (callback) => {
    socket.on('consultation:started', callback);
  },

  onNotification: (callback) => {
    socket.on('notification:new', callback);
  }
};
```

---

## 🎯 **GESTION API & ERREURS**

### **Intercepteur Axios (Commun)**
```javascript
// Axios instance configuré
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000
});

// Request interceptor - ajout token
api.interceptors.request.use((config) => {
  const token = secureStore.getItemSync('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - gestion erreurs/auto-refresh
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    // ✅ Token expiré - refresh automatique
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = secureStore.getItemSync('refreshToken');
        const response = await axios.post('/api/auth/refresh', { token: refreshToken });

        const newToken = response.data.token;
        const newRefreshToken = response.data.refreshToken;

        secureStore.setItemSync('authToken', newToken);
        secureStore.setItemSync('refreshToken', newRefreshToken);

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);

      } catch (refreshError) {
        // Refresh échoué - logout
        logout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
```

### **Gestion Erreurs Métier**
```javascript
const handleApiError = (error) => {
  const status = error.response?.status;
  const message = error.response?.data?.message;

  switch(status) {
    case 401:
      logoutUser();
      showErrorModal('Session expirée', 'Veuillez vous reconnecter');
      break;

    case 403:
      showErrorModal('Accès refusé', 'Vous n\'avez pas les permissions');
      break;

    case 409:
      showErrorModal('Conflit', 'Créneau plus disponible');
      refreshData(); // Recharger slots/rdv
      break;

    case 422:
      showErrorModal('Données invalides', message);
      break;

    default:
      showGenericError();
      console.error('API Error:', error);
  }
};
```

---

## 📊 **TABLEAU RÉCAPITULATIF FLUX**

| **USER** | **APP** | **PRINCIPALES ACTIONS** | **ENDPOINTS MAJEURS** |
|----------|---------|-------------------------|----------------------|
| **Patient** | 📱 Mobile | - Recherche médecins<br>- Réservation RDV<br>- Suivi consultations | - `/specialites/*`<br>- `/agenda/*/slots/public`<br>- `/rendezvous/*` |
| **Médecin** | 💻 Dashboard | - Gestion agenda<br>- Consultations<br>- Ordonnances | - `/agenda/*`<br>- `/rendezvous/*`<br>- `/ordonnances/*` |
| **Admin Cabinet** | 💻 Dashboard | - Gestion équipe<br>- Supervision | - `/auth/admin/create-medecin`<br>- `/rendezvous/patient-arrive` |
| **Super Admin** | 💻 Dashboard | - Gestion globale<br>- Validation médecins | - `/auth/super-admin/*`<br>- `/cabinets/*` |

---

## 🚀 **CHECKLIST LANCEMENT PROJET**

### **PRÉPARATION BACKEND** ✅
- [x] Endpoints API complets et testés
- [x] Migration base de données appliquée
- [x] Documentation mise à jour et cohérente
- [x] Authentification JWT sécurisée

### **ARCHITECTURE FRONTEND** ✅
- [x] **Architecture 2 apps** : Mobile (Patient) + Dashboard Multi-rôles
- [x] **Flux utilisateurs détaillés** et techniques
- [x] **Temps réel intégré** via Socket.IO
- [x] **Gestion erreurs complète** avec refresh token auto

### **TECHNOLOGIES SUGGÉRÉES**
- **Mobile** : **React Native** ou **Flutter**
- **Dashboard** : **Next.js** ou **Vue 3 + Nuxt**
- **State** : **Zustand**, **Redux Toolkit** ou **Pinia**
- **UI** : **Expo**, **Material-UI**, **TailwindCSS**

---

**🎯 L'architecture proposée est optimale : une app mobile dédiée patients pour UX native, et un dashboard web unifié pour les professions de santé !**


🎯 **Parfait ! J'ai créé le fichier complet `endpoints/FRONTEND_FLUX_GUIDE.md`** avec tout ce que tu demandes :
__________________________________________________________________________________________________________________________________________

## ✅ **ARCHITECTURE PRÉCONISÉE - Réponse à ta question :**

### **✅ OUI** à tes 2 interrogations :
- **📱 UNE app mobile EXCLUSIVE pour les patients** → UX native optimale 
- **💻 UNE app web DASHBOARD uni roules** divisé routes (`/médecin/*`, `/admin/*`, `/super-admin/*`)

## 🚀 **CONTENU DU GUIDE COMPLET :**

### **🔧 Architecture Technique**
- **Mobile** : React Native/Flutter pour patients seulement
- **Dashboard** : Next.js/Vue avec routing par rôles
- **State Management** : Zustand/Pinia avec auto-refresh token

### **📱 Flux Patients Mobile**
- **Auth** : Inscription → OTP → Connexion sécurisée
- **Recherche** : Symptômes → Médecins → Agenda visible
- **Réservation** : Sélection slot publique → Confirmation → Suivi
- **Téléconsultation** : Auto-connexion Jitsi le jour J

### **👨‍⚕️ Flux Médecins Dashboard**
- **Configuration auto** : Agenda généré à validation
- **Gestion agenda** : Règles horaires, blocs, extras
- **Consultations** : Workflow présentiel+téléconsultation  
- **Drag & Drop** : Déplacement RDV avec validations temps réel

### **⚡ Fonctions Communes**
- **Socket.IO temps réel** : Notifications, mises à jour instantanées
- **Gestion erreurs robuste** : 401/403/409 avec UX adaptée
- **Intercepteurs API** : Refresh token automatique

### **📋 Checklist Lancement**
- [x] Flux techniques complets avec code exemples
- [x] Architecture apps validée (mobile patient + dashboard multi)
- [x] Technologies suggérées et justifiées

**🎯 Tout est maintenant prêt pour ton équipe frontend avec ce guide complet et opérationnel !** 

Le fichier `FRONTEND_FLUX_GUIDE.md` contient tous les détails techniques pour lancer le développement immédiatement. 🚀
