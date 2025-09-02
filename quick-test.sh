#!/bin/bash

# 🧪 Script de test rapide des endpoints SantéAfrik

echo "🚀 Test des Endpoints SantéAfrik"
echo "================================="

BASE_URL="http://localhost:3000"

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour tester un endpoint
test_endpoint() {
    local method=$1
    local url=$2
    local data=$3
    local description=$4
    
    echo -e "${BLUE}🔍 Test: $description${NC}"
    echo -e "${YELLOW}$method $url${NC}"
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "HTTPSTATUS:%{http_code}" "$url")
    else
        response=$(curl -s -w "HTTPSTATUS:%{http_code}" -X "$method" -H "Content-Type: application/json" -d "$data" "$url")
    fi
    
    # Extraire le code de statut
    http_code=$(echo "$response" | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
    body=$(echo "$response" | sed -e 's/HTTPSTATUS\:.*//g')
    
    if [[ "$http_code" -ge 200 && "$http_code" -lt 300 ]]; then
        echo -e "${GREEN}✅ SUCCESS ($http_code)${NC}"
        echo "$body" | jq '.' 2>/dev/null || echo "$body"
    elif [[ "$http_code" -ge 400 && "$http_code" -lt 500 ]]; then
        echo -e "${YELLOW}⚠️  CLIENT ERROR ($http_code)${NC}"
        echo "$body" | jq '.' 2>/dev/null || echo "$body"
    else
        echo -e "${RED}❌ ERROR ($http_code)${NC}"
        echo "$body"
    fi
    
    echo "---"
}

# Vérifier si le serveur est démarré
echo "🔍 Vérification de la connectivité du serveur..."
if ! curl -s "$BASE_URL" > /dev/null; then
    echo -e "${RED}❌ Serveur non accessible sur $BASE_URL${NC}"
    echo "💡 Démarrez le serveur avec: npm start"
    exit 1
fi

echo -e "${GREEN}✅ Serveur accessible${NC}"
echo ""

# Tests des endpoints
echo "📡 TESTS DES ENDPOINTS DE BASE"
echo "==============================="

test_endpoint "GET" "$BASE_URL/" "" "Page d'accueil API"
test_endpoint "GET" "$BASE_URL/health" "" "Health check"
test_endpoint "GET" "$BASE_URL/api/auth/test" "" "Test route auth"

echo ""
echo "🔐 TESTS D'AUTHENTIFICATION"
echo "============================"

# Test inscription patient
patient_data='{
  "nom": "Dupont",
  "prenom": "Jean", 
  "email": "jean.test'$(date +%s)'@test.com",
  "motDePasse": "MotDePasse123!",
  "telephone": "+2250701234567",
  "dateNaissance": "1990-05-15",
  "sexe": "M",
  "adresse": "123 Rue Test",
  "groupeSanguin": "A+"
}'

test_endpoint "POST" "$BASE_URL/api/auth/inscription/patient" "$patient_data" "Inscription patient"

# Test inscription médecin
medecin_data='{
  "nom": "Martin",
  "prenom": "Dr. Pierre",
  "email": "dr.martin'$(date +%s)'@test.com",
  "motDePasse": "MotDePasse123!",
  "telephone": "+2250701234568",
  "numOrdre": "12345",
  "specialites": ["Cardiologie"],
  "experience": 10
}'

test_endpoint "POST" "$BASE_URL/api/auth/inscription/medecin" "$medecin_data" "Inscription médecin"

# Test connexion (devrait échouer car pas de compte réel)
login_data='{
  "email": "test@test.com",
  "motDePasse": "MotDePasse123!"
}'

test_endpoint "POST" "$BASE_URL/api/auth/connexion" "$login_data" "Connexion (test d'échec)"

echo ""
echo "🛠️  TESTS DÉVELOPPEMENT"
echo "======================="

# Test création super admin (dev)
admin_data='{
  "nom": "Admin",
  "prenom": "Super",
  "email": "admin'$(date +%s)'@test.com",
  "motDePasse": "SuperAdmin123!",
  "telephone": "+2250701234569"
}'

test_endpoint "POST" "$BASE_URL/api/auth/dev/creer-super-admin" "$admin_data" "Créer super admin (DEV)"

echo ""
echo "🎉 Tests terminés !"
echo "==================="

echo -e "${BLUE}💡 Pour des tests plus avancés :${NC}"
echo "   - Utilisez la collection Postman (POSTMAN_COLLECTION.md)"
echo "   - Configurez une vraie base de données PostgreSQL"
echo "   - Activez l'envoi d'emails pour les OTP"