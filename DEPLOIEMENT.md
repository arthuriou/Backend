## Déploiement

### Environnement développement
```bash
npm run start  # Démarre avec nodemon/ts-node
```

### Build production
```bash
npm run build
pm2 start build/index.js --name "santeafrik-api"
```

### Déploiement Vercel (recommandé)
```bash
npm install -g vercel
vercel --prod
```

## Support et Maintenance

### Logs système
```bash
# Logs via PM2
pm2 logs santeafrik-api

# Logs accès DB
# Configurer PostgreSQL logging dans db config
```

### Monitoring
- Surveillance temps réel avec PM2 monit
- Alerte automatique sur erreurs serveur

### Mises à jour sécurité
- Audit npm régulier : `npm audit`
- Mise à jour dépendances : `npm update`
- Monitoring failles connues via Snyk ou outils similaires

## Contribution

1. Fork le repository
2. Créer branche feature
3. Commits avec messages clairs
4. Pull request vers main

## Licence

Propriétaire - Voir termes d'utilisation SantéAfrik.
