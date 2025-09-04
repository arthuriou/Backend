import { Request, Response } from "express";
import { DossierMedicalService } from "./dossier-medical.service";

const service = new DossierMedicalService();

export class DossierMedicalController {
  async getOrCreate(req: Request, res: Response) {
    try {
      const { patientId } = req.params;
      if (!patientId) return res.status(400).json({ message: "patientId requis" });
      const result = await service.getOrCreateDossier(patientId);
      res.json(result);
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
      const doc = await service.addDocument({
        dossier_id: body.dossier_id,
        nom: body.nom,
        type: body.type,
        url: file ? `/uploads/documents/${file.filename}` : body.url,
        mimetype: file ? file.mimetype : body.mimetype,
        taillekb: file ? Math.ceil((file.size || 0) / 1024) : body.taillekb,
        ispublic: body.ispublic
      });
      res.status(201).json(doc);
    } catch (error: any) {
      res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
  }

  async deleteDocument(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) return res.status(400).json({ message: "id requis" });
      const ok = await service.deleteDocument(id);
      res.json({ success: ok });
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


