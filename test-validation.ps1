Write-Host "🔍 Test de validation d'un médecin..." -ForegroundColor Cyan

try {
    # 1. Connexion SuperAdmin
    Write-Host "`n1️⃣ Connexion SuperAdmin..." -ForegroundColor Yellow
    $loginBody = @{
        email = "superadmin@santeafrik.com"
        motdepasse = "password"
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method POST -ContentType "application/json" -Body $loginBody
    Write-Host "✅ SuperAdmin connecté" -ForegroundColor Green
    $token = $loginResponse.data.token
    Write-Host "🔑 Token: $($token.Substring(0, 50))..." -ForegroundColor Gray

    # 2. Récupérer les médecins en attente
    Write-Host "`n2️⃣ Récupération des médecins en attente..." -ForegroundColor Yellow
    $headers = @{"Authorization" = "Bearer $token"}
    $pendingResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/super-admin/pending-medecins" -Method GET -Headers $headers
    
    Write-Host "📋 Médecins en attente: $($pendingResponse.data.Count)" -ForegroundColor Gray
    
    if ($pendingResponse.data.Count -eq 0) {
        Write-Host "❌ Aucun médecin en attente trouvé" -ForegroundColor Red
        return
    }
    
    $firstMedecin = $pendingResponse.data[0]
    Write-Host "👨‍⚕️ Premier médecin:" -ForegroundColor Cyan
    Write-Host "   ID: $($firstMedecin.idmedecin)" -ForegroundColor Gray
    Write-Host "   Nom: $($firstMedecin.nom)" -ForegroundColor Gray
    Write-Host "   Email: $($firstMedecin.email)" -ForegroundColor Gray
    Write-Host "   Statut: $($firstMedecin.statut)" -ForegroundColor Gray

    # 3. Valider le médecin
    Write-Host "`n3️⃣ Validation du médecin..." -ForegroundColor Yellow
    $validateBody = @{
        medecinId = $firstMedecin.idmedecin
        action = "APPROVED"
    } | ConvertTo-Json

    $validateResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/super-admin/validate-medecin" -Method POST -ContentType "application/json" -Headers $headers -Body $validateBody
    
    Write-Host "✅ Validation réussie:" -ForegroundColor Green
    Write-Host "   Message: $($validateResponse.message)" -ForegroundColor Gray

} catch {
    Write-Host "❌ Erreur: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "📋 Réponse: $responseBody" -ForegroundColor Red
    }
}
