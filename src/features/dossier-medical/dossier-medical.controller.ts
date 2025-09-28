import { Request, Response } from "express";
import { DossierMedicalService } from "./dossier-medical.service";
import { isCloudinaryEnabled, uploadImageToCloudinary } from "../../shared/utils/cloudinary";

const service = new DossierMedicalService();

export class DossierMedicalController {
  async getOrCreateMe(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId as string | undefined;
      if (!userId) return res.status(401).json({ message: "Non authentifié" });
      const result = await service.getOrCreateForUser(userId);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
  }

  async getOrCreate(req: Request, res: Response) {
    try {
      const { patientId } = req.params;
      if (!patientId) return res.status(400).json({ message: "patientId requis" });
      try {
        const result = await service.getOrCreateDossier(patientId);
        res.json(result);
      } catch (e: any) {
        if (e?.status === 404) return res.status(404).json({ message: e.message });
        throw e;
      }
    } catch (error: any) {
      res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
  }

  async listDocuments(req: Request, res: Response) {
    try {
      const { dossierId } = req.params;
      if (!dossierId) return res.status(400).json({ message: "dossierId requis" });
      const docs = await service.listDocuments(dossierId);
      res.json(docs);
    } catch (error: any) {
      res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
  }

  async addDocument(req: Request, res: Response) {
    try {
      const file = (req as any).file as any;
      const body = req.body || {};
      if (!body?.dossier_id || !body?.nom) {
        return res.status(400).json({ message: "dossier_id et nom requis" });
      }
      let finalUrl = body.url;
      let finalMime = file ? file.mimetype : body.mimetype;
      let finalSizeKb = file ? Math.ceil((file.size || 0) / 1024) : body.taillekb;

      if (file) {
        if (!isCloudinaryEnabled()) {
          return res.status(502).json({ message: "Cloudinary non configuré" });
        }
        // Uploader vers Cloudinary (resource_type auto)
        const folder = `dossier/${body.dossier_id}`;
        // uploadImageToCloudinary actuellement force resource_type=image; on ajoute un mode binaire générique via url upload_stream avec resource_type: 'auto'
        // Reconfig rapide ici au besoin
        try {
          const { v2: cloudinary } = await import('cloudinary');
          // S'assurer de la config
          const { configureCloudinary } = await import('../../shared/utils/cloudinary');
          configureCloudinary();
          const result: any = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream({ 
              folder, 
              resource_type: 'auto',
              access_mode: 'public', // Rendre les fichiers publics
              type: 'upload' // Type d'upload standard
            }, (error: any, resu: any) => {
              if (error) return reject(error);
              resolve(resu);
            });
            stream.end(file.buffer);
          });
          finalUrl = result.secure_url || result.url;
          // Cloudinary ne renvoie pas toujours le mimetype, on garde celui du fichier
        } catch (e: any) {
          return res.status(502).json({ message: "Échec upload Cloudinary", error: e?.message || String(e) });
        }
      }

      try {
        const doc = await service.addDocument({
          dossier_id: body.dossier_id,
          nom: body.nom,
          type: body.type,
          url: finalUrl,
          mimetype: finalMime,
          taillekb: finalSizeKb,
          ispublic: body.ispublic
        });
        res.status(201).json(doc);
      } catch (e: any) {
        if (e?.status === 404) return res.status(404).json({ message: e.message });
        throw e;
      }
    } catch (error: any) {
      res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
  }

  async deleteDocument(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) return res.status(400).json({ message: "id requis" });
      const userId = (req as any).user?.userId as string | undefined;
      const role = (req as any).user?.role as string | undefined;
      if (!userId) return res.status(401).json({ message: "Non authentifié" });
      try {
        await service.authorizeAndDeleteDocument(id, userId, role || '');
        res.json({ success: true });
      } catch (e: any) {
        if (e?.status === 404) return res.status(404).json({ message: e.message });
        if (e?.status === 403) return res.status(403).json({ message: e.message });
        throw e;
      }
    } catch (error: any) {
      res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
  }

  async updateDocument(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const update = req.body || {};
      const doc = await service.updateDocumentMeta(id, update);
      res.json(doc);
    } catch (error: any) {
      res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
  }

  // Servir un document avec authentification (proxy Cloudinary)
  async viewDocument(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.userId;
      
      if (!id) {
        res.status(400).json({ message: "ID du document requis" });
        return;
      }
      
      if (!userId) {
        res.status(401).json({ message: "Utilisateur non authentifié" });
        return;
      }

      // Récupérer le document
      const document = await service.getDocumentById(id);
      if (!document) {
        res.status(404).json({ message: "Document non trouvé" });
        return;
      }

      // Vérifier que l'utilisateur est le propriétaire du dossier
      const dossier = await service.getDossierById(document.dossier_id);
      if (!dossier) {
        res.status(404).json({ message: "Dossier non trouvé" });
        return;
      }

      const patientId = await service.getPatientIdFromUserId(userId);
      if (!patientId || dossier.patient_id !== patientId) {
        res.status(403).json({ message: "Accès refusé: vous n'êtes pas propriétaire de ce document" });
        return;
      }

      // Récupérer le fichier (Cloudinary ou local)
      const documentUrl = document.url;
      console.log('🔍 Debug viewDocument:', {
        documentId: id,
        documentUrl,
        documentExists: !!document,
        documentName: document.nom
      });
      
      if (!documentUrl) {
        res.status(404).json({ message: "URL du document manquante" });
        return;
      }
      
      let response;
      
      // Vérifier si c'est une URL locale ou Cloudinary
      if (documentUrl.startsWith('/uploads/')) {
        // URL locale - servir directement depuis le système de fichiers
        console.log('📁 Fichier local détecté:', documentUrl);
        
        const fs = await import('fs');
        const path = await import('path');
        
        const filePath = path.join(process.cwd(), 'uploads', documentUrl.replace('/uploads/', ''));
        
        try {
          // Vérifier que le fichier existe
          await fs.promises.access(filePath);
          
          // Lire le fichier et l'envoyer
          const fileBuffer = await fs.promises.readFile(filePath);
          
          // Définir les headers appropriés
          res.setHeader('Content-Type', document.mimetype || 'application/octet-stream');
          res.setHeader('Content-Disposition', `inline; filename="${document.nom}"`);
          res.setHeader('Cache-Control', 'private, max-age=3600');
          res.setHeader('Content-Length', fileBuffer.length);
          
          // Envoyer le fichier
          res.end(fileBuffer);
          return;
          
        } catch (fileError) {
          console.error('❌ Erreur lecture fichier local:', fileError);
          res.status(404).json({ message: "Fichier local non trouvé" });
          return;
        }
        
      } else if (documentUrl.startsWith('https://res.cloudinary.com/')) {
        // URL Cloudinary - utiliser la logique existante
        console.log('☁️ Fichier Cloudinary détecté:', documentUrl);
        
        // Essayer d'abord l'URL directe
        response = await fetch(documentUrl);
        console.log('🌐 Cloudinary response (direct):', {
          status: response.status,
          statusText: response.statusText
        });
        
        // Si accès refusé/unauthorized/bad request, essayer avec une URL signée
        if (response.status === 401 || response.status === 403 || response.status === 400) {
          console.log('🔄 Tentative avec URL signée...');
          try {
            const { v2: cloudinary } = await import('cloudinary');
            const { configureCloudinary } = await import('../../shared/utils/cloudinary');
            configureCloudinary();
            
            // Extraire resource_type et public_id complets depuis l'URL Cloudinary
            // Exemple: https://res.cloudinary.com/<cloud>/<resource_type>/upload/v<version>/dossier/<...>/<public_id>.<ext>
            const url = new URL(documentUrl);
            const pathParts = url.pathname.split('/').filter(Boolean);
            // pathParts: [ '<cloud_name?>', '<resource_type>', '<type>', 'v<version>?', ... publicId parts ... ]
            const resourceType = pathParts[1] || 'auto';
            const deliveryType = pathParts[2] || 'upload';
            // Récupérer le segment après le type (upload/authenticated/private)
            const typeIndex = pathParts.findIndex(p => p === 'upload' || p === 'authenticated' || p === 'private');
            let afterUploadParts = typeIndex >= 0 ? pathParts.slice(typeIndex + 1) : [];
            // Retirer éventuellement le segment de version 'v\d+'
            if (afterUploadParts.length && /^v\d+$/.test(afterUploadParts[0])) {
              afterUploadParts = afterUploadParts.slice(1);
            }
            // Recomposer le public_id (sans l'extension)
            const lastPart = afterUploadParts[afterUploadParts.length - 1] || '';
            const lastPartNoExt = lastPart.replace(/\.[^.]+$/, '');
            const publicIdParts = [...afterUploadParts.slice(0, -1), lastPartNoExt];
            const fullPublicId = publicIdParts.join('/');
            const fileExtMatch = lastPart.match(/\.([^.]+)$/);
            const fileExt = fileExtMatch ? fileExtMatch[1] : undefined;
            
            // Extraire la version (ex: v1758696369) et la passer pour éviter le défaut v1
            let versionNumber: number | undefined = undefined;
            const versionSegment = afterUploadParts.length ? (pathParts.find(p => /^v\d+$/.test(p)) || '') : '';
            if (/^v\d+$/.test(versionSegment)) {
              versionNumber = Number(versionSegment.substring(1));
            }

            // Générer une URL signée
            let signedUrl = cloudinary.url(fullPublicId, {
              resource_type: (resourceType as any) || 'auto',
              type: (deliveryType as any) || 'upload',
              sign_url: true,
              secure: true,
              ...(versionNumber ? { version: versionNumber } : {}),
              expires_at: Math.floor(Date.now() / 1000) + 3600 // 1 heure
            });
            
            console.log('🔐 URL signée générée:', signedUrl);
            response = await fetch(signedUrl);
            console.log('🌐 Cloudinary response (signed):', {
              status: response.status,
              statusText: response.statusText
            });

            // Si toujours 401 avec type 'upload', tenter type 'authenticated'
            if (response.status === 401 && deliveryType === 'upload') {
              console.log('🔁 Retry en authenticated...');
              signedUrl = cloudinary.url(fullPublicId, {
                resource_type: (resourceType as any) || 'auto',
                type: 'authenticated',
                sign_url: true,
                secure: true,
                ...(versionNumber ? { version: versionNumber } : {}),
                ...(fileExt ? { format: fileExt } : {}),
                expires_at: Math.floor(Date.now() / 1000) + 3600
              });
              console.log('🔐 URL signée (authenticated) générée:', signedUrl);
              response = await fetch(signedUrl);
              console.log('🌐 Cloudinary response (signed/authenticated):', {
                status: response.status,
                statusText: response.statusText
              });
            }
          } catch (signError) {
            console.error('❌ Erreur génération URL signée:', signError);
          }
        }
        
        if (!response.ok) {
          res.status(404).json({ 
            message: "Fichier non trouvé sur Cloudinary",
            details: {
              status: response.status,
              statusText: response.statusText,
              url: documentUrl
            }
          });
          return;
        }
        
      } else {
        // URL invalide
        res.status(400).json({ 
          message: "Format d'URL non supporté",
          details: { url: documentUrl }
        });
        return;
      }

      // Définir les headers appropriés
      res.setHeader('Content-Type', document.mimetype || 'application/octet-stream');
      res.setHeader('Content-Disposition', `inline; filename="${document.nom}"`);
      res.setHeader('Cache-Control', 'private, max-age=3600'); // Cache 1 heure

      // Streamer le fichier vers le client
      if (response.body) {
        // Convertir ReadableStream vers Node.js stream
        const reader = response.body.getReader();
        const pump = async () => {
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              res.write(value);
            }
            res.end();
          } catch (error) {
            console.error('Erreur streaming:', error);
            res.status(500).json({ message: "Erreur lors du streaming du fichier" });
          }
        };
        pump();
      } else {
        res.status(500).json({ message: "Erreur lors de la récupération du fichier" });
      }
      
    } catch (error: any) {
      console.error('Erreur serveur document:', error);
      res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
  }
}

export default new DossierMedicalController();


