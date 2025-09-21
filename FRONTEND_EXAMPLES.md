# 💡 EXEMPLES CONCRETS D'INTÉGRATION FRONTEND - SANTÉAFRIK

## 🎯 Exemples Prêts à l'Emploi

### 1. 🔐 Authentification Complète

#### LoginScreen.tsx
```typescript
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService } from '../services/apiService';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    // Validation
    if (!email.trim() || !password.trim()) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    try {
      // Appel API avec le bon format
      const response = await apiService.login(email.trim(), password);
      
      // Sauvegarder les données
      await AsyncStorage.setItem('token', response.token);
      await AsyncStorage.setItem('user', JSON.stringify(response.user));
      
      // Navigation selon le rôle
      if (response.user.role === 'PATIENT') {
        navigation.navigate('PatientApp');
      } else if (response.user.role === 'MEDECIN') {
        navigation.navigate('DoctorApp');
      }
      
    } catch (error) {
      console.error('Erreur connexion:', error);
      Alert.alert('Erreur', error.message || 'Identifiants incorrects');
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
        autoCorrect={false}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Mot de passe"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      
      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.buttonText}>Se connecter</Text>
        )}
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
  buttonDisabled: {
    backgroundColor: '#bdc3c7'
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

### 2. 👤 Gestion du Profil

#### ProfileScreen.tsx
```typescript
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Image
} from 'react-native';
import { apiService } from '../services/apiService';

export default function ProfileScreen() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await apiService.getProfile();
      setProfile(response.data);
      setFormData(response.data);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger le profil');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      // Validation des données
      if (!formData.nom?.trim() || !formData.prenom?.trim()) {
        Alert.alert('Erreur', 'Nom et prénom sont requis');
        return;
      }

      // Appel API avec le bon format
      const response = await apiService.updateProfile({
        nom: formData.nom.trim(),
        prenom: formData.prenom.trim(),
        telephone: formData.telephone?.trim(),
        adresse: formData.adresse?.trim(),
        groupeSanguin: formData.groupeSanguin,
        poids: formData.poids ? parseFloat(formData.poids) : null,
        taille: formData.taille ? parseFloat(formData.taille) : null
      });

      setProfile(response.data);
      setEditing(false);
      Alert.alert('Succès', 'Profil mis à jour');
      
    } catch (error) {
      Alert.alert('Erreur', error.message || 'Impossible de mettre à jour le profil');
    }
  };

  const handleChangePassword = async () => {
    Alert.prompt(
      'Changer le mot de passe',
      'Entrez votre nouveau mot de passe',
      async (newPassword) => {
        if (!newPassword || newPassword.length < 6) {
          Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 6 caractères');
          return;
        }

        try {
          await apiService.changePassword({
            ancienMotDePasse: 'ancien', // À récupérer via un prompt
            nouveauMotDePasse: newPassword
          });
          Alert.alert('Succès', 'Mot de passe modifié');
        } catch (error) {
          Alert.alert('Erreur', error.message || 'Impossible de changer le mot de passe');
        }
      }
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Chargement...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        {profile.photoProfil ? (
          <Image source={{ uri: profile.photoProfil }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>
              {profile.prenom?.[0]}{profile.nom?.[0]}
            </Text>
          </View>
        )}
        <Text style={styles.name}>{profile.prenom} {profile.nom}</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nom</Text>
          <TextInput
            style={styles.input}
            value={formData.nom || ''}
            onChangeText={(text) => setFormData({...formData, nom: text})}
            editable={editing}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Prénom</Text>
          <TextInput
            style={styles.input}
            value={formData.prenom || ''}
            onChangeText={(text) => setFormData({...formData, prenom: text})}
            editable={editing}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={[styles.input, styles.disabledInput]}
            value={profile.email || ''}
            editable={false}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Téléphone</Text>
          <TextInput
            style={styles.input}
            value={formData.telephone || ''}
            onChangeText={(text) => setFormData({...formData, telephone: text})}
            editable={editing}
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Adresse</Text>
          <TextInput
            style={styles.input}
            value={formData.adresse || ''}
            onChangeText={(text) => setFormData({...formData, adresse: text})}
            editable={editing}
            multiline
          />
        </View>

        {profile.role === 'PATIENT' && (
          <>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Groupe sanguin</Text>
              <TextInput
                style={styles.input}
                value={formData.groupeSanguin || ''}
                onChangeText={(text) => setFormData({...formData, groupeSanguin: text})}
                editable={editing}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Poids (kg)</Text>
              <TextInput
                style={styles.input}
                value={formData.poids?.toString() || ''}
                onChangeText={(text) => setFormData({...formData, poids: text})}
                editable={editing}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Taille (cm)</Text>
              <TextInput
                style={styles.input}
                value={formData.taille?.toString() || ''}
                onChangeText={(text) => setFormData({...formData, taille: text})}
                editable={editing}
                keyboardType="numeric"
              />
            </View>
          </>
        )}
      </View>

      <View style={styles.actions}>
        {editing ? (
          <>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.buttonText}>Sauvegarder</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={() => {
                setFormData(profile);
                setEditing(false);
              }}
            >
              <Text style={styles.cancelButtonText}>Annuler</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity style={styles.editButton} onPress={() => setEditing(true)}>
              <Text style={styles.buttonText}>Modifier</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.passwordButton} onPress={handleChangePassword}>
              <Text style={styles.passwordButtonText}>Changer mot de passe</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  header: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    marginBottom: 10
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10
  },
  avatarText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold'
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50'
  },
  form: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 10
  },
  inputGroup: {
    marginBottom: 15
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#2c3e50'
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16
  },
  disabledInput: {
    backgroundColor: '#f8f9fa',
    color: '#6c757d'
  },
  actions: {
    padding: 20
  },
  editButton: {
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10
  },
  saveButton: {
    backgroundColor: '#27ae60',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10
  },
  cancelButton: {
    backgroundColor: '#e74c3c',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10
  },
  passwordButton: {
    backgroundColor: 'transparent',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3498db'
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16
  },
  cancelButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16
  },
  passwordButtonText: {
    color: '#3498db',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16
  }
});
```

### 3. 🔍 Recherche de Médecins

#### SearchDoctorsScreen.tsx
```typescript
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
  ActivityIndicator,
  Alert
} from 'react-native';
import { apiService } from '../services/apiService';

export default function SearchDoctorsScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState(null);
  const [specialties, setSpecialties] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingSpecialties, setLoadingSpecialties] = useState(true);

  useEffect(() => {
    loadSpecialties();
  }, []);

  const loadSpecialties = async () => {
    try {
      const response = await apiService.getSpecialties();
      setSpecialties(response.data);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger les spécialités');
    } finally {
      setLoadingSpecialties(false);
    }
  };

  const searchDoctors = async () => {
    if (!searchQuery.trim() && !selectedSpecialty) {
      Alert.alert('Erreur', 'Veuillez saisir un nom ou sélectionner une spécialité');
      return;
    }

    setLoading(true);
    try {
      const params = {
        q: searchQuery.trim(),
        limit: 20,
        offset: 0
      };

      if (selectedSpecialty) {
        params.specialite_id = selectedSpecialty.idspecialite;
      }

      const response = await apiService.searchDoctors(params);
      setDoctors(response.data);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de rechercher les médecins');
    } finally {
      setLoading(false);
    }
  };

  const selectDoctor = (doctor) => {
    navigation.navigate('DoctorDetails', { doctor });
  };

  const renderDoctor = ({ item }) => (
    <TouchableOpacity 
      style={styles.doctorCard} 
      onPress={() => selectDoctor(item)}
    >
      <View style={styles.doctorInfo}>
        {item.photoprofil ? (
          <Image source={{ uri: item.photoprofil }} style={styles.doctorAvatar} />
        ) : (
          <View style={styles.doctorAvatarPlaceholder}>
            <Text style={styles.doctorAvatarText}>
              {item.prenom?.[0]}{item.nom?.[0]}
            </Text>
          </View>
        )}
        
        <View style={styles.doctorDetails}>
          <Text style={styles.doctorName}>
            {item.prenom} {item.nom}
          </Text>
          <Text style={styles.doctorSpecialties}>
            {item.specialites?.map(s => s.nom).join(', ')}
          </Text>
          <Text style={styles.doctorExperience}>
            {item.experience} ans d'expérience
          </Text>
          {item.biographie && (
            <Text style={styles.doctorBio} numberOfLines={2}>
              {item.biographie}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher un médecin..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={searchDoctors}
        />
        
        <TouchableOpacity style={styles.searchButton} onPress={searchDoctors}>
          <Text style={styles.searchButtonText}>Rechercher</Text>
        </TouchableOpacity>
      </View>

      {loadingSpecialties ? (
        <ActivityIndicator style={styles.loading} />
      ) : (
        <View style={styles.specialtiesContainer}>
          <Text style={styles.sectionTitle}>Spécialités</Text>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={specialties}
            keyExtractor={(item) => item.idspecialite}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.specialtyChip,
                  selectedSpecialty?.idspecialite === item.idspecialite && styles.selectedSpecialtyChip
                ]}
                onPress={() => setSelectedSpecialty(
                  selectedSpecialty?.idspecialite === item.idspecialite ? null : item
                )}
              >
                <Text style={[
                  styles.specialtyText,
                  selectedSpecialty?.idspecialite === item.idspecialite && styles.selectedSpecialtyText
                ]}>
                  {item.nom}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {loading ? (
        <ActivityIndicator style={styles.loading} />
      ) : (
        <FlatList
          data={doctors}
          keyExtractor={(item) => item.idmedecin}
          renderItem={renderDoctor}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {searchQuery || selectedSpecialty ? 
                  'Aucun médecin trouvé' : 
                  'Recherchez un médecin ou sélectionnez une spécialité'
                }
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: 'white',
    alignItems: 'center'
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginRight: 10,
    fontSize: 16
  },
  searchButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8
  },
  searchButtonText: {
    color: 'white',
    fontWeight: 'bold'
  },
  specialtiesContainer: {
    backgroundColor: 'white',
    paddingVertical: 15,
    marginBottom: 10
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 15,
    marginBottom: 10,
    color: '#2c3e50'
  },
  specialtyChip: {
    backgroundColor: '#ecf0f1',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginLeft: 15
  },
  selectedSpecialtyChip: {
    backgroundColor: '#3498db'
  },
  specialtyText: {
    color: '#2c3e50',
    fontWeight: '500'
  },
  selectedSpecialtyText: {
    color: 'white'
  },
  doctorCard: {
    backgroundColor: 'white',
    marginHorizontal: 15,
    marginBottom: 10,
    borderRadius: 10,
    padding: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  doctorInfo: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  doctorAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15
  },
  doctorAvatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15
  },
  doctorAvatarText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold'
  },
  doctorDetails: {
    flex: 1
  },
  doctorName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4
  },
  doctorSpecialties: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 4
  },
  doctorExperience: {
    fontSize: 12,
    color: '#95a5a6',
    marginBottom: 4
  },
  doctorBio: {
    fontSize: 12,
    color: '#7f8c8d',
    fontStyle: 'italic'
  },
  loading: {
    marginTop: 50
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50
  },
  emptyText: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center'
  }
});
```

### 4. 📅 Création de Rendez-vous

#### BookAppointmentScreen.tsx
```typescript
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { apiService } from '../services/apiService';

export default function BookAppointmentScreen({ route, navigation }) {
  const { doctor, selectedSlot } = route.params;
  const [appointmentType, setAppointmentType] = useState('PRESENTIEL');
  const [motif, setMotif] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Erreur chargement utilisateur:', error);
    }
  };

  const bookAppointment = async () => {
    // Validation
    if (!motif.trim()) {
      Alert.alert('Erreur', 'Veuillez indiquer le motif de la consultation');
      return;
    }

    if (appointmentType === 'PRESENTIEL' && !doctor.cabinet?.adresse) {
      Alert.alert('Erreur', 'Adresse du cabinet non disponible');
      return;
    }

    setLoading(true);
    try {
      const appointmentData = {
        patient_id: user.idPatient,
        medecin_id: doctor.idmedecin,
        creneau_id: selectedSlot.idcreneau,
        dateheure: selectedSlot.debut,
        duree: selectedSlot.duree || 30,
        motif: motif.trim(),
        type_rdv: appointmentType,
        adresse_cabinet: appointmentType === 'PRESENTIEL' ? doctor.cabinet?.adresse : null
      };

      const response = await apiService.createAppointment(appointmentData);
      
      Alert.alert(
        'Rendez-vous confirmé',
        'Votre rendez-vous a été créé avec succès',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('PatientDashboard')
          }
        ]
      );
      
    } catch (error) {
      console.error('Erreur création RDV:', error);
      Alert.alert('Erreur', error.message || 'Impossible de créer le rendez-vous');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Prendre rendez-vous</Text>
        <Text style={styles.subtitle}>
          Dr. {doctor.prenom} {doctor.nom}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Type de consultation</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={appointmentType}
            onValueChange={setAppointmentType}
            style={styles.picker}
          >
            <Picker.Item label="Présentiel" value="PRESENTIEL" />
            <Picker.Item label="Téléconsultation" value="TELECONSULTATION" />
          </Picker>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Détails du créneau</Text>
        <View style={styles.slotInfo}>
          <Text style={styles.slotText}>
            📅 {new Date(selectedSlot.debut).toLocaleDateString('fr-FR')}
          </Text>
          <Text style={styles.slotText}>
            🕐 {new Date(selectedSlot.debut).toLocaleTimeString('fr-FR', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </Text>
          <Text style={styles.slotText}>
            ⏱️ {selectedSlot.duree || 30} minutes
          </Text>
        </View>
      </View>

      {appointmentType === 'PRESENTIEL' && doctor.cabinet?.adresse && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Adresse du cabinet</Text>
          <Text style={styles.addressText}>
            📍 {doctor.cabinet.adresse}
          </Text>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Motif de la consultation *</Text>
        <TextInput
          style={styles.textArea}
          value={motif}
          onChangeText={setMotif}
          placeholder="Décrivez brièvement le motif de votre consultation..."
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.bookButton, loading && styles.bookButtonDisabled]}
          onPress={bookAppointment}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.bookButtonText}>Confirmer le rendez-vous</Text>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelButtonText}>Annuler</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    alignItems: 'center',
    marginBottom: 10
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d'
  },
  section: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 10
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#f8f9fa'
  },
  picker: {
    height: 50
  },
  slotInfo: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef'
  },
  slotText: {
    fontSize: 16,
    color: '#2c3e50',
    marginBottom: 5
  },
  addressText: {
    fontSize: 16,
    color: '#2c3e50',
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef'
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
    minHeight: 100
  },
  actions: {
    padding: 20
  },
  bookButton: {
    backgroundColor: '#27ae60',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center'
  },
  bookButtonDisabled: {
    backgroundColor: '#bdc3c7'
  },
  bookButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold'
  },
  cancelButton: {
    backgroundColor: 'transparent',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e74c3c',
    alignItems: 'center'
  },
  cancelButtonText: {
    color: '#e74c3c',
    fontSize: 16,
    fontWeight: 'bold'
  }
});
```

### 5. 💬 Messagerie

#### ChatScreen.tsx
```typescript
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import { apiService } from '../services/apiService';
import { socketService } from '../services/socketService';

export default function ChatScreen({ route, navigation }) {
  const { conversationId, doctor } = route.params;
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const flatListRef = useRef(null);

  useEffect(() => {
    loadMessages();
    setupSocketListeners();
    
    return () => {
      // Nettoyer les listeners
      socketService.disconnect();
    };
  }, []);

  const loadMessages = async () => {
    try {
      const response = await apiService.getMessages(conversationId);
      setMessages(response.data);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger les messages');
    } finally {
      setLoading(false);
    }
  };

  const setupSocketListeners = () => {
    socketService.onNewMessage((message) => {
      if (message.conversation_id === conversationId) {
        setMessages(prev => [...prev, message]);
        scrollToBottom();
      }
    });
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const messageText = newMessage.trim();
    setNewMessage('');
    setSending(true);

    try {
      const response = await apiService.sendMessage(conversationId, messageText);
      setMessages(prev => [...prev, response.data]);
      scrollToBottom();
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'envoyer le message');
      setNewMessage(messageText); // Restaurer le message
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const renderMessage = ({ item }) => {
    const isMe = item.expediteur?.idutilisateur === user?.idUtilisateur;
    
    return (
      <View style={[
        styles.messageContainer,
        isMe ? styles.myMessage : styles.otherMessage
      ]}>
        <Text style={[
          styles.messageText,
          isMe ? styles.myMessageText : styles.otherMessageText
        ]}>
          {item.contenu}
        </Text>
        <Text style={[
          styles.messageTime,
          isMe ? styles.myMessageTime : styles.otherMessageTime
        ]}>
          {new Date(item.dateEnvoi).toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Chargement des messages...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          Dr. {doctor.prenom} {doctor.nom}
        </Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.idmessage}
        renderItem={renderMessage}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={scrollToBottom}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Tapez votre message..."
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.sendButton, sending && styles.sendButtonDisabled]}
          onPress={sendMessage}
          disabled={sending || !newMessage.trim()}
        >
          <Text style={styles.sendButtonText}>Envoyer</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  header: {
    backgroundColor: 'white',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef'
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50'
  },
  messagesList: {
    flex: 1
  },
  messagesContent: {
    padding: 15
  },
  messageContainer: {
    marginBottom: 15,
    maxWidth: '80%'
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#3498db',
    borderRadius: 20,
    borderBottomRightRadius: 5,
    padding: 12
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: 'white',
    borderRadius: 20,
    borderBottomLeftRadius: 5,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e9ecef'
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20
  },
  myMessageText: {
    color: 'white'
  },
  otherMessageText: {
    color: '#2c3e50'
  },
  messageTime: {
    fontSize: 12,
    marginTop: 5
  },
  myMessageTime: {
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'right'
  },
  otherMessageTime: {
    color: '#7f8c8d'
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    alignItems: 'flex-end'
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    maxHeight: 100,
    fontSize: 16
  },
  sendButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20
  },
  sendButtonDisabled: {
    backgroundColor: '#bdc3c7'
  },
  sendButtonText: {
    color: 'white',
    fontWeight: 'bold'
  }
});
```

## 🎯 Service API Complet

#### apiService.ts
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

class ApiService {
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
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('user');
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
      console.error(`Erreur API ${method} ${endpoint}:`, error);
      throw error;
    }
  }

  // Authentification
  async login(email: string, password: string) {
    return this.request('POST', '/auth/login', { 
      email: email.trim(), 
      motdepasse: password 
    });
  }

  async sendOTP(email: string) {
    return this.request('POST', '/auth/send-otp', { email });
  }

  async verifyOTP(email: string, code: string) {
    return this.request('POST', '/auth/verify-otp', { email, code });
  }

  // Profil
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

  async changePassword(data: any) {
    const user = await AsyncStorage.getItem('user');
    const endpoint = user?.role === 'PATIENT' ? '/patients/change-password' : '/medecins/change-password';
    return this.request('PUT', endpoint, data);
  }

  // Recherche
  async getSpecialties() {
    return this.request('GET', '/specialites/specialites?limit=50');
  }

  async searchDoctors(params: any) {
    const queryString = new URLSearchParams(params).toString();
    return this.request('GET', `/specialites/medecins/search?${queryString}`);
  }

  // Rendez-vous
  async getAvailableSlots(medecinId: string, dateDebut: string, dateFin: string) {
    return this.request('GET', `/rendezvous/creneaux/disponibles?medecinId=${medecinId}&dateDebut=${dateDebut}&dateFin=${dateFin}`);
  }

  async createAppointment(data: any) {
    return this.request('POST', '/rendezvous', data);
  }

  async getPatientAppointments(patientId: string) {
    return this.request('GET', `/rendezvous/patient/${patientId}`);
  }

  // Messagerie
  async createConversation(participantId: string) {
    return this.request('POST', '/messagerie/conversations/private', { participantId });
  }

  async getConversations() {
    return this.request('GET', '/messagerie/conversations');
  }

  async sendMessage(conversationId: string, contenu: string) {
    return this.request('POST', '/messagerie/messages', {
      conversationId,
      contenu,
      type: 'TEXTE'
    });
  }

  async getMessages(conversationId: string) {
    return this.request('GET', `/messagerie/conversations/${conversationId}/messages`);
  }

  // Dossier médical
  async getMedicalRecord() {
    return this.request('GET', '/dossier-medical/dossier/me');
  }

  async getMedicalDocuments(dossierId: string) {
    return this.request('GET', `/dossier-medical/${dossierId}/documents`);
  }

  // Notifications
  async getNotificationPreferences() {
    return this.request('GET', '/notifications/preferences');
  }

  async updateNotificationPreferences(data: any) {
    return this.request('PUT', '/notifications/preferences', data);
  }

  async registerDevice(data: any) {
    return this.request('POST', '/notifications/devices', data);
  }
}

export const apiService = new ApiService();
```

**Ces exemples sont prêts à l'emploi et couvrent tous les cas d'usage principaux !** 🚀
