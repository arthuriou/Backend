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
            const stream = cloudinary.uploader.upload_stream({ folder, resource_type: 'auto' }, (error: any, resu: any) => {
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
}

export default new DossierMedicalController();


