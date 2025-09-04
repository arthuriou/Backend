import { Request, Response } from "express";
import { OrdonnancesService } from "./ordonnances.service";

const service = new OrdonnancesService();

export class OrdonnancesController {
  async create(req: Request, res: Response) {
    try {
      const body = req.body;
      if (!body?.consultation_id) return res.status(400).json({ message: "consultation_id requis" });
      const data = await service.create(body);
      res.status(201).json(data);
    } catch (error: any) {
      res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
  }

  async listByConsultation(req: Request, res: Response) {
    try {
      const { consultationId } = req.params;
      if (!consultationId) return res.status(400).json({ message: "consultationId requis" });
      const list = await service.listByConsultation(consultationId);
      res.json(list);
    } catch (error: any) {
      res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
  }

  async get(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = await service.getWithLignes(id);
      if (!data) return res.status(404).json({ message: "Ordonnance non trouvée" });
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updated = await service.update(id, req.body || {});
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
  }

  async remove(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const ok = await service.remove(id);
      res.json({ success: ok });
    } catch (error: any) {
      res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
  }
}

export default new OrdonnancesController();


