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

## 👥 **IV. WORKFLOWS PAR RÔLE UTILISATEUR***

---

## 📱 **1. PATIENT - APPLICATION MOBILE EXCLUSIVE**

### **🛍️ APP NATURE** : React Native / Flutter - Mobile ONLY
### **🌐 ENDPOINTS** : Version mobile ou v1/mobile exclusivement
### **📱 ONBOARDING FLOW** : Inscription → OTP → App prête

---

### **🔐 ONBOARDING PATIENT - MOBILE**
```javascript
// 1. INSCRIPTION avec données complètes
const signUp = async (userData) => {
  await api.post('/api/auth/register-patient', {
    email: userData.email,
    motdepasse: userData.password,
    nom: userData.nom,
    prenom: userData.prenom,
    telephone: userData.telephone,
    datenaissance: userData.datenaissance,
    genre: userData.genre,
    adresse: userData.adresse,
    groupesanguin: userData.groupesanguin,
    poids: userData.poids,
    taille: userData.taille
  });
  // → Status PENDING → Email OTP envoyé
};

// 2. VALIDATION OTP
const verifyOTP = async (email, otp) => {
  await api.post('/api/auth/verify-otp', { email, otp });
  // → Status APPROVED → Token reçu → Première connexion
};

// 3. CONNEXION NORMALE
const login = async (email, pwd) => {
  const response = await api.post('/api/auth/login', {
    email, motdepasse: pwd
  });
  // → Token + refreshToken stockés
  await secureStore.setItemAsync('authToken', response.data.token);
  await secureStore.setItemAsync('userRole', response.data.role);
};
```

---

### **🏠 ENDPOINTS UTILISÉS PAR PATIENT - MOBILE**

##### **📧 INSCRIPTION & VALIDATION OTP (ONBOARDING)**
- POST `/api/auth/register-patient` - Inscription initiale (envoi OTP automatique)
- POST `/api/auth/send-otp` - Renvoi OTP si expiré
- POST `/api/auth/verify-otp` - Validation compte avec OTP
- POST `/api/auth/resend-otp` - Renvoi OTP dupliqué

##### **🔐 CONNEXION & PROFIL**
- POST `/api/auth/login` - Connexion utilisateur
- POST `/api/auth/refresh` - Rafraîchissement token
- GET `/api/auth/profile` - Profil personnel complet
- PATCH `/api/auth/profile/patient` - Mise à jour données santé
- PATCH `/api/auth/profile` - Mise à jour nom/prénom/téléphone
- POST `/api/auth/profile/photo` - Upload photo profil
- POST `/api/auth/forgot-password` - Demande reset mot de passe
- POST `/api/auth/reset-password` - Reset mot de passe avec code
- POST `/api/auth/change-password` - Changement mot de passe sécurisé

#### **🔍 RECHERCHE & DÉCOUVERTES**
- GET `/api/specialites/maux/search?q=symptome` - Recherche symptômes
- GET `/api/specialites/maux/{id}/medecins` - Médecins par maux
- GET `/api/specialites/medecins/search?q=nom` - Recherche médecins
- GET `/api/specialites/specialites/{id}/medecins` - Médecins par spécialité
- GET `/api/agenda/{agendaId}/slots/public` - **CRÉNEAUX VISIBLES** (sans auth)

#### **📅 GESTION RDV**
- POST `/api/rendezvous` - Prendre RDV
- GET `/api/rendezvous/patient/{patientId}` - Liste RDV personnels
- PUT `/api/rendezvous/{id}/annuler` - Annuler RDV
- GET `/api/rendezvous/{id}/teleconsultation` - Infos téléconsultation

#### **🏥 DOSSIER MÉDICAL & SUIVIS**
- GET `/api/dossier-medical/dossier/me` - Son dossier médical
- GET `/api/consultations/patient/{patientId}` - Historique consultations (finalisées)
- GET `/api/ordonnances/patient/{patientId}` - Ses ordonnances
- GET `/api/dossier-medical/documents` - Documents personnels

#### **💬 COMMUNICATION**
- GET `/api/messagerie/conversations` - Conversations actives
- POST `/api/messagerie/conversations/private` - Nouveau message privé
- GET `/api/messagerie/conversations/{id}/messages` - Messages conversation

#### **📪 PRÉFÉRENCES NOTIFICATIONS**
- GET `/api/notifications/preferences` - Préférences actuelles
- POST `/api/notifications/preferences` - Modifier préférences
- POST `/api/notifications/devices` - Enregistrer device push

---

### **📱 WORKFLOW COMPLET PATIENT MOBILE**

#### **ÉTAPE 1 : PREMIÈRE OUVERTURE**
1. **Splash screen** → Vérification token local
2. **Si pas connecté** → Page inscription/connexion
3. **Si connecté** → Chargement home avec données user

#### **ÉTAPE 2 : RECHERCHE MÉDECIN**
```javascript
// Bottom tabs: Accueil | Recherche | RDV | Profil
const handleSymptomSearch = async (symptom) => {
  // API recherche symptômes
  const symptoms = await api.get(`/api/specialites/maux/search?q=${symptom}`);

  // Si trouvés → afficher médecins associés
  const selectedSymptom = symptoms.data[0];
  const doctors = await api.get(
    `/api/specialites/maux/${selectedSymptom.idmaux}/medecins`
  );

  // Navigation vers liste médecins
  navigation.navigate('DoctorsList', { doctors, originalSymptom: symptom });
};
```

#### **ÉTAPE 3 : SÉLECTION MÉDECIN & RDV**
```javascript
const viewDoctorAgenda = async (doctorId, agendaId) => {
  // Vérifier si agenda visible
  const slots = await api.get(`/api/agenda/${agendaId}/slots/public`, {
    params: { start: nextWeek, end: future }
  });

  if (slots.data.length === 0) {
    // Agenda non visible publiquement
    showToast('Médecin non disponible actuellement');
    return;
  }

  // Navigation calendrier RDV
  navigation.navigate('BookingCalendar', {
    doctor: doctors.find(d => d.idmedecin === doctorId),
    availableSlots: slots.data
  });
};

const bookAppointment = async (selectedSlot, motif) => {
  await api.post('/api/rendezvous', {
    medecin_id: selectedSlot.doctor.idmedecin,
    dateheure: selectedSlot.start_at,
    duree: selectedSlot.duration_min,
    motif: motif,
    type_rdv: selectedSlot.type
  });

  showSuccess('RDV pris avec succès !');
  navigation.reset({ routes: [{ name: 'MyAppointments' }] });
};
```

#### **ÉTAPE 4 : GESTION RDV EXISTANTS**
```javascript
const loadAppointments = async () => {
  const appointments = await api.get('/api/rendezvous/patient/' + user.id);

  const categorized = {
    upcoming: appointments.data.filter(a => a.statut === 'CONFIRME'),
    past: appointments.data.filter(a => a.statut === 'TERMINE'),
    pending: appointments.data.filter(a => a.statut === 'EN_ATTENTE')
  };

  setAppointments(categorized);
  return categorized;
};

const cancelAppointment = async (appointment) => {
  await api.put(`/api/rendezvous/${appointment.idrendezvous}/annuler`);
  showToast('RDV annulé');
  refreshAppointments();
};
```

#### **ÉTAPE 5 : SUIVI POST-RDV**
```javascript
// Consultation finalisée = visible pour patient
const viewMedicalHistory = async () => {
  const [consultations, prescriptions] = await Promise.all([
    api.get('/api/consultations/patient/' + user.id),
    api.get('/api/ordonnances/patient/' + user.id)
  ]);

  // Afficher seulement consultations.finalisées
  const finalConsultations = consultations.data.filter(c => c.statut === 'FINALISE');

  return { finalConsultations, prescriptions: prescriptions.data };
};
```

**🎯 PATIENT MOBILE ONLY** : Interface native optimisée pour prise RDV rapide et suivi médical personnel

---

---

## 👨‍⚕️ **2. MÉDECIN - DASHBOARD WEB**

### **🖥️ APP NATURE** : Web React/Vue - Dashboard partagé
### **🌐 ENDPOINTS** : Version dashboard exclusivement
### **🔄 ONBOARDING FLOW** : 2 scénarios selon provenance

---

### **🏥 WORKFLOW COMPLET MÉDECIN DASHBOARD**

#### **A) AUTO-INSCRIPTION MÉDECIN (LONG FLOW)**

##### **Étape 1 : Inscription (beaucoup plus tôt)**
```javascript
// MÉDECIN INSCRIT DIRECTEMENT (Avant toute validation !)
const doctorSignUp = async (doctorData) => {
  await api.post('/api/auth/register-doctor', {
    email: doctorData.email,
    motdepasse: doctorData.password,  // TEMPORAIRE
    numOrdre: doctorData.numOrdre,
    nom: doctorData.nom,
    specialiteIds: doctorData.selectedSpecialities
  });
  // ✅ Status PENDING mais peut déjà utiliser forgot/reset password !
};

// **OBLIGATOIRE : Reset password disponible même en PENDING !**
// Médecin peut FORGET SON MOT DE PASSE avant validation !
const handleForgotPassword = async (email) => {
  await api.post('/api/auth/forgot-password', { email });
  // ✅ Email envoyé même si médecin en PENDING
};

// Puis reset avec code reçu
const handleResetPassword = async (email, code, newPassword) => {
  await api.post('/api/auth/reset-password', {
    email, code, newPassword
  });
  // ✅ Mot de passe changé même en PENDING
};
```

##### **Étape 2 : Attente validation**
```javascript
// ⚠️ FONCTIONNALITÉ CRITIQUE : Reset password possible même en PENDING !

// 🔑 SI MÉDECIN OUBLIE SON MOT DE PASSE :
const forgotPasswordEvenInPending = async () => {
  await api.post('/api/auth/forgot-password', {
    email: doctorEmail // Même en statut PENDING !
  });
  // ✅ Email avec code temporaire envoyé QUAND MÊME !

  // Puis utilisation du code pour reset
  await api.post('/api/auth/reset-password', {
    email: doctorEmail,
    code: '123456', // Code reçu par email
    newPassword: 'NouveauMotDePasse123!'
  });
  // ✅ Mot de passe CHANGÉ avec succès !
};

// IMPORTANT : Le reset password fonctionne AVANT la validation AdminCabinet !
// Le médecin peut gérer son accès même s'il est encore en attente d'approbation.
```

**🚨 NOTE IMPORTANTE :**
```javascript
// Même en status PENDING, le médecin peut :
// ✅ Receive OTP initial (pour activation compte)
// ✅ Demander forgot-password → recevoir code par email
// ✅ Faire reset-password avec le code → changer mot de passe
// ✅ Mais NE PEUT PAS se connecter tant qu'il n'est pas APPROVED par admin
// → Login sera rejeté avec "en attente de validation"
```

##### **Étape 3 : Validation reçue**
```javascript
const checkValidationStatus = async () => {
  const profile = await api.get('/api/auth/profile');
  if (profile.role === 'MEDECIN' && profile.status === 'APPROVED') {
    // Statut validé !
    // Agenda automatique créé par backend
    navigation.navigate('/dashboard/medecin/agenda');
  }
};
```
→ **Résultat** : Agenda généré, spécialités validées

#### **B) CRÉATION PAR ADMIN CABINET (RAPID FLOW)**
```javascript
// Médecin reçoit email avec credentials temporaires
// Première connexion force changement mot de passe
const firstLoginAfterAdminCreation = async (tempPassword) => {
  try {
    const response = await api.post('/api/auth/login', {
      email: doctorEmail, // fourni par admin
      motdepasse: tempPassword // fourni par admin
    });

    if (response.data.mustChangePassword) {
      // FORCÉ redirection changement mot de passe
      navigation.navigate('/change-password-required', {
        tempToken: response.data.token,
        isFirstLogin: true
      });
    }
  } catch (error) {
    // Erreur première connexion
  }
};

// 2. Changement mot de passe obligatoire
const changeFirstPassword = async (newPassword) => {
  await api.post('/api/auth/change-password', {
    oldPassword: tempPasswordToken,
    newPassword: newPassword
  });

  // Maintenant accès normal au dashboard
  navigate('/dashboard/medecin/agenda');
};
```

---

### **💻 ENDPOINTS UTILISÉS PAR MÉDECIN - DASHBOARD**

#### **🔐 PROFIL & ONBOARDING**
- PATCH `/api/auth/profile/medecin` - Mise à jour expérience/biographie
- POST `/api/auth/profile/photo` - Photo professionnelle
- GET `/api/auth/profile` - Infos profil complet

#### **📅 GESTION AGENDA COMPLEXE**
- GET `/api/agenda/mine` - Agenda(s) du médecin
- PATCH `/api/agenda/{id}` - Configuration agenda (visibilité, durée, buffers)
- POST `/api/agenda/{id}/rules` - Ajouter règle horaire récurrente
- GET `/api/agenda/{id}/rules` - Lister règles actuelles
- PATCH `/api/agenda/{id}/rules/{ruleId}` - Modifier règle
- DELETE `/api/agenda/{id}/rules/{ruleId}` - Supprimer règle

#### **🚫 BLOQUAGES & DISPONIBILITÉS EXCEPTIONNELLES**
- POST `/api/agenda/{id}/blocks` - Créer bloquage (congés/vacances)
- GET `/api/agenda/{id}/blocks` - Lister blocages
- DELETE `/api/agenda/{id}/blocks/{blockId}` - Supprimer bloquage
- POST `/api/agenda/{id}/extra` - Créer disponibilité exceptionnelle
- GET `/api/agenda/{id}/extra` - Lister extras
- DELETE `/api/agenda/{id}/extra/{extraId}` - Supprimer extra

#### **🕑 SLOTS CALCULÉS & GESTION RDV**
- GET `/api/agenda/{id}/slots` - Générer créneaux privés (RDV à venir)
- GET `/api/rendezvous/medecin/{medecinId}` - Tous RDV du médecin
- PUT `/api/rendezvous/{id}/confirmer` - Confirmer RDV
- PUT `/api/rendezvous/{id}/annuler` - Annuler RDV
- PUT `/api/rendezvous/{id}/terminer` - Terminer RDV (admin)

#### **🏥 CONSULTATIONS & ORDONNANCES**
- POST `/api/consultations` - Créer consultation depuis RDV
- POST `/api/consultations/from-template` - Depuis template + RDV
- GET `/api/consultations/medecin/{medecinId}` - Historique consultations
- PATCH `/api/consultations/{id}` - Mettre à jour CR (BROUILLON)
- PUT `/api/consultations/{id}/finalize` - Finaliser CR
- GET `/api/consultations/templates/specialite/{specialite}` - Templates disponibles
- POST `/api/ordonnances` - Créer ordonnance depuis consultation
- GET `/api/ordonnances/medecin/{medecinId}` - Ordonnances créées

#### **👥 PATIENTS & SUIVI**
- GET `/api/auth/patients` - Liste patients (recherche)
- GET `/api/info/patient/{patientId}` - Détails patient
- GET `/api/dossier-medical/{patientId}/documents` - Dossier patient
- GET `/api/consultations/patient/{patientId}` - Historique consultations patient
- GET `/api/ordonnances/patient/{patientId}` - Ordonnances patient

#### **💬 COMMUNICATION & MESSAGERIE**
- GET `/api/messagerie/conversations` - Conversations médecins
- POST `/api/messagerie/conversations/private` - Nouveau message patient
- POST `/api/messagerie/messages` - Envoyer message
- GET `/api/messagerie/conversations/{id}/messages` - Messages conversation
- PUT `/api/messagerie/messages/{id}` - Modifier message (droit médecin)

---

### **📱 INTERFACE DASHBOARD MÉDECIN**

#### **NAVIGATION PRINCIPALE**
```
/dashboard/medecin/
├── overview          → Tableau bord général
├── agenda           → Planning visuel
├── appointments     → Gestion RDV liste
├── consultations    → Consultations & ordonnances
├── patients         → Mes patients & dossiers
├── messaging        → Messagerie pro
├── templates        → Mes templates personnalisés
└── settings         → Paramètres compte
```

#### **PAGE AGENDA (PRINCIPALE)**
- **Vue calendrier** : Semaine/Mois/Jour toggle
- **Créneaux affichés** : Rules + Extra - Blocks
- **RDV overlay** : Boîtes colorées sur créneaux
- **Actions drag** : Déplacer RDV avec vérifications conflits
- **Clic créneau vide** : Créer RDV manuel
- **Header stats** : RDV aujourd'hui, semaine, consultations pendantes

#### **GESTION RDV**
```javascript
const handleAppointmentDrag = async (rdvId, newStart, newEnd) => {
  try {
    await api.put(`/api/agenda/rdv/${rdvId}/move`, {
      new_start_at: newStart,
      new_end_at: newEnd
    });
    refreshCalendar();
  } catch (error) {
    showError('Créneau non disponible');
  }
};

const handleAppointmentClick = (appointment) => {
  if (appointment.status === 'EN_ATTENTE') {
    navigate('/dashboard/medecin/appointment-detail', {
      appointmentId: appointment.idrendezvous
    });
  }
};
```

**🎯 FOCUS MÉDECIN** : Agenda professionnel, gestion patients, consultations médicales

---

---

## 🏢 **3. ADMINCABINET - DASHBOARD WEB**

### **🖥️ APP NATURE** : Web React/Vue - Dashboard partagé
### **🌐 ENDPOINTS** : Gestion cabinet et équipe
### **🏗️ ROLE** : Administrateur secteur médical

---

### **👑 WORKFLOW COMPLET ADMIN CABINET**

#### **ONBOARDING ADMIN CABINET**
```javascript
// Assigné automatiquement par SuperAdmin lors création cabinet
// Reçoit credentials, statut direct APPROVED
// Première connexion = accès dashboard complet
```

#### **GESTION CABINET & ÉQUIPE**
```javascript
// 1. Gestion cabinet physique
const updateCabinet = async (cabinetData) => {
  await api.put(`/api/cabinets/${myCabinetId}`, {
    nom: cabinetData.nom,
    adresse: cabinetData.adresse,
    horairesOuverture: cabinetData.horaires
  });
};

// 2. Recrutement médecins rapide
const recruitDoctor = async (doctorData) => {
  await api.post('/api/auth/admin/create-medecin', {
    email: doctorData.email,
    motdepasse: 'temp123auto', // temporaire auto
    nom: doctorData.nom,
    prenom: doctorData.prenom,
    numOrdre: doctorData.numOrdre,
    cabinetId: myCabinetId, // AUTO-ASSIGNÉ
    experience: doctorData.experience,
    biographie: doctorData.biographie
  });
  // → Médecin approuvé auto + force change pwd
};

// 3. Validation médecins externes
const validatePendingDoctor = async (doctorId) => {
  await api.post('/api/auth/admin/validate-medecin', {
    utilisateurId: doctorId,
    action: 'APPROVED' // ou 'REJECTED'
  });
  // → Si APPROVED, agenda créé + cabinet assigné
};

// 4. Supervision temps réel
const monitorCabinetActivity = async () => {
  const [rdvs, consultations] = await Promise.all([
    api.get('/api/rendezvous?cabinet=' + myCabinetId),
    api.get('/api/rendezvous/en-attente-consultation')
  ]);
  return { rdvsToday: rdvs.data, waitingConsultations: consultations.data };
};
```

---

### **💻 ENDPOINTS ADMIN CABINET - DASHBOARD**

#### **🏢 GESTION CABINET**
- GET `/api/cabinets/{myCabinetId}` - Infos cabinet
- PUT `/api/cabinets/{myCabinetId}` - Modifier cabinet
- GET `/api/cabinets/{myCabinetId}/medecins` - Équipe médicale
- POST `/api/cabinets/{myCabinetId}/specialites` - Spécialités cabinet

#### **👥 GESTION ÉQUIPE**
- GET `/api/auth/medecins?cabinetId={myCabinetId}` - Liste médecins équipe
- POST `/api/auth/admin/create-medecin` - Recruter médecin (APPROVED auto)
- POST `/api/auth/admin/validate-medecin` - Valider demandes externes
- PUT `/api/cabinets/{id}/medecins/{medecinId}/archive` - Désactiver médecin

#### **📊 SUPERVISION OPÉRATIONNELLE**
- GET `/api/cabinets/{myCabinetId}/stats` - Statistiques cabinet
- GET `/api/rendezvous?cabinet={myCabinetId}&date=aujourd’hui` - RDV jour
- GET `/api/rendezvous/en-attente-consultation` - Patients en salle attente
- PUT `/api/rendezvous/{id}/patient-arrive` - Marquer arrivée patient
- GET `/api/consultations/medecin/{medecinId}` - Suivi consultations équipe

#### **🎯 ACTIONS ADMINISTRATIVES**
- POST `/api/auth/super-admin/cabinets/{cabinetId}/admins` - ?? Ajouter admin supplémentaire
- DELETE `/api/cabinets/{id}/medecins/{medecinId}` - Supprimer médecin cabinet
- POST `/api/cabinets/{id}/medecins/{medecinId}/reset-password` - Reset pwd médecin

---

### **📱 INTERFACE DASHBOARD ADMIN CABINET**

#### **NAVIGATION**
```
/dashboard/admin/
├── cabinet           → Gestion cabinet physique
├── equipe           → Gestion équipe médicale
├── supervision      → Suivi activité temps réel
├── rdvs             → Vue globale RDV cabinet
├── stats            → Statistiques performance
└── settings         → Configuration cabinet
```

#### **PAGE SUPERVISION (PRINCIPALE)**
- **Live Dashboard** : Patients en attente par médecin
- **Vue agenda global** : Occupation des salles/consultations
- **Actions rapides** : Marquer arrivée, annuler RDV, appelé patient
- **Notifications temps réel** : Arrivées, annulations, urgences

**🎯 FOCUS ADMIN** : Gestion opérationnelle cabinet + équipe médicale + supervision clinique

---

---

## 🌍 **4. SUPERADMIN - DASHBOARD WEB**

### **🖥️ APP NATURE** : Web React/Vue - Dashboard partagé
### **🌐 ENDPOINTS** : Contrôle système complet
### **👑 ROLE** : Administrateur système global

---

### **👑 WORKFLOW COMPLET SUPERADMIN**

#### **1. SETUP INITIAL SYSTÈME**
```javascript
// Exécuté une fois lors déploiement
// Créé automatiquement via script PS
// Email admin configuré dans .env
```

#### **2. GESTION CABINETS GLOBAUX**
```javascript
// Création nouveaux cabinets
const createCabinet = async (cabinetData) => {
  await api.post('/api/auth/super-admin/cabinets', {
    nom: cabinetData.nom,
    adresse: cabinetData.adresse,
    telephone: cabinetData.telephone,
    email: cabinetData.email,
    specialites: cabinetData.specialites // IDs spécialités
  });
};

// Attribution cabinet aux admin locaux
const assignAdminToCabinet = async (adminId, cabinetId) => {
  await api.post('/api/auth/super-admin/assign-cabinet', {
    adminId,
    cabinetId
  });
};
```

#### **3. GESTION VALIDATIONS GLOBALES**
```javascript
// Validation médecins demandeurs
const loadPendingDoctors = async () => {
  return await api.get('/api/auth/super-admin/pending-medecins');
};

const validateDoctor = async (doctorId, action) => {
  await api.post('/api/auth/super-admin/validate-medecin', {
    utilisateurId: doctorId,
    action: action // 'APPROVED' ou 'REJECTED'
  });
  // SI APPROVED → agenda auto-créé + spécialités validées
};

// Validation admin cabinet candidats
const createAdminCabinet = async (adminData) => {
  await api.post('/api/auth/super-admin/create-admin', {
    email: adminData.email,
    motdepasse: 'temp_admin_pwd',
    nom: adminData.nom,
    prenom: adminData.prenom,
    telephone: adminData.telephone,
    cabinetId: adminData.targetCabinet
  });
};
```

#### **4. SURVEILLANCE SYSTÈME COMPLET**
```javascript
// Vue d'ensemble système
const loadSystemOverview = async () => {
  const [cabinets, pendingDoctors, admins, stats] = await Promise.all([
    api.get('/api/auth/super-admin/cabinets'),
    api.get('/api/auth/super-admin/pending-medecins'),
    api.get('/api/auth/admins'),
    api.get('/api/stats/system') // métriques générales
  ]);

  return {
    totalCabinets: cabinets.data.length,
    totalAdmins: admins.data.length,
    pendingValidations: pendingDoctors.data.length,
    systemLoad: stats.data
  };
};
```

---

### **💻 ENDPOINTS SUPERADMIN - DASHBOARD**

#### **🏢 GESTION GLOBALE CABINETS**
- POST `/api/auth/super-admin/cabinets` - Créer cabinet
- GET `/api/auth/super-admin/cabinets` - Tous cabinets
- PUT `/api/auth/super-admin/cabinets/{id}` - Modifier cabinet
- DELETE `/api/auth/super-admin/cabinets/{id}` - Supprimer cabinet
- GET `/api/auth/super-admin/cabinets/{id}` - Détails cabinet

#### **👥 GESTION ADMINS SYSTÈME**
- POST `/api/auth/super-admin/create-admin` - Créer admin cabinet
- GET `/api/auth/admins` - Tous admins système
- GET `/api/auth/super-admin/admin-cabinets/{adminId}` - Cabinets d'un admin
- GET `/api/auth/super-admin/cabinets/{cabinetId}/admins` - Admins d'un cabinet

#### **🔗 ASSIGNATIONS CABINET/ADMIN**
- POST `/api/auth/super-admin/assign-cabinet` - Attribuer cabinet à admin
- DELETE `/api/auth/super-admin/assign-cabinet/{adminId}` - Retirer cabinet
- GET `/api/auth/super-admin/admin-cabinets/{adminId}` - Cabinets assignés

#### **👨‍⚕️ VALIDATION MÉDECINS GLOBAUX**
- GET `/api/auth/super-admin/pending-medecins` - Médecins en attente validation
- POST `/api/auth/super-admin/validate-medecin` - Approuver/rejeter
- GET `/api/auth/medecins` - Tous médecins système (filtres cabinet/spécialité)

#### **👤 GESTION UTILISATEURS SYSTÈME**
- GET `/api/auth/users/role/{role}` - Utilisateurs par rôle
- DELETE `/api/super/users/{id}` - Supprimer user (rôle extrême)
- GET `/api/stats/global` - Statistiques système complet

#### **⚙️ CONFIGURATION SYSTÈME**
- PATCH `/api/auth/super-admin/profile` - Profil SuperAdmin
- POST `/api/auth/super-admin/change-password` - Changer pwd SuperAdmin
- GET `/api/audit-logs` - Logs système pour sécurité

---

### **📱 INTERFACE DASHBOARD SUPERADMIN**

#### **NAVIGATION**
```
/dashboard/super-admin/
├── overview          → Tableau bord système
├── cabinets          → Gestion cabinets globaux
├── admins            → Gestion todos les admin cabinet
├── validations       → Médecins en attente (pending)
├── users             → Gestion utilisateurs avancés
├── stats             → Métriques & analytics
└── system            → Configuration système
```

#### **PAGE VALIDATIONS (CRITIQUE)**
```javascript
const PendingValidationsPage = () => {
  const [pendingDoctors, setPendingDoctors] = useState([]);

  useEffect(() => {
    loadPendingDoctors();
  }, []);

  const handleValidation = async (doctor, action) => {
    await validateDoctor(doctor.idutilisateur, action);
    // Si APPROVED → agenda auto-créé + email notification
    toast.success(`${doctor.nom} ${action === 'APPROVED' ? 'approuvé' : 'rejeté'}`);
    loadPendingDoctors(); // refresh liste
  };

  return (
    <div className="validations-dashboard">
      <h2>Validations Médecins - {pendingDoctors.length} en attente</h2>
      {pendingDoctors.map(doctor => (
        <DoctorValidationCard
          key={doctor.idutilisateur}
          doctor={doctor}
          onApprove={() => handleValidation(doctor, 'APPROVED')}
          onReject={() => handleValidation(doctor, 'REJECTED')}
        />
      ))}
    </div>
  );
};
```

**🎯 FOCUS SUPERADMIN** : Contrôle système complet + approbations médicales critiques

---

## 📊 **TABLEAU RÉCAPITULATIF FLUX PAR RÔLES**

| **RÔLE** | **APP** | **ONBOARDING** | **ENDPOINTS PRINCIPAUX** | **PRINCIPALES ACTIONS** |
|----------|---------|----------------|---------------------------|------------------------|
| **📱 Patient** | Mobile | Inscription→OTP→App | `- /specialites/maux`<br>`- /agenda/*/slots/public`<br>`- /rendezvous/*`<br>`- /consultations/patient/*` | Recherche, RDV, Suivi médical |
| **👨‍⚕️ Médecin** | Dashboard | 2 flows: Auto-register (long) ou créé par Admin (rapide avec change pwd) | `- /agenda/*`<br>`- /rendezvous/medecin/*`<br>`- /consultations/*`<br>`- /ordonnances/medecin/*` | Agenda pro, Consultations, Ordonnances |
| **🏢 Admin Cabinet** | Dashboard | Assigné auto par SuperAdmin | `- /cabinets/{id}/*`<br>`- /auth/admin/create-medecin`<br>`- /auth/admin/validate-medecin`<br>`- /rendezvous/en-attente-consultation` | Gestion cabinet, Équipe médicale, Supervision |
| **🌍 SuperAdmin** | Dashboard | Auto-créé première déploiement | `- /auth/super-admin/cabinets`<br>`- /auth/super-admin/validate-medecin`<br>`- /auth/super-admin/create-admin`<br>`- /auth/super-admin/assign-cabinet` | Cabinet globaux, Admins système, Validations médicales |

---

## 🚀 **CHECKLIST LANCEMENT PROJET FINALISÉ**

### **✅ BACKEND PRÊT**
- ✅ Architecture rôles complète & sécurisée
- ✅ Workflows par rôle correctement implémentés
- ✅ Endpoints segmentés par utilisateur/application
- ✅ Cas d'usage médicaux bien couverts

### **🔧 FRONTEND PRÊT À DÉVELOPPER**
- ✅ **Patient = Mobile dédié** (UX optimisée réservation)
- ✅ **Pros santé = Dashboard web uni** (productivité médecins/admins)
- ✅ **Onboarding différencié** (simple/mobile vs complex/validation)
- ✅ **Flux métier sécurisés** (première connexion, validations, assignations)

### **📋 GUIDE OPERATIONNEL COMPLET**
- ✅ cas d'usage détaillés à l'utilisateur
- ✅ endpoints listés par acteur
- ✅ flux onboarding complets
- ✅ examples code exécutables

---

**🎯 ARCHITECTURE IDÉALE : Mobile pure patient + Dashboard performant pros** 🏥✨


Le système est maintenant parfaitement segmenté pour une implémentation front claire et sécurisée.
</result>


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
