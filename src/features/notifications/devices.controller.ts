import { Request, Response } from "express";
import { DevicesService } from "./devices.service";

const service = new DevicesService();

export class DevicesController {
  async register(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) { res.status(401).json({ message: 'Auth requise' }); return; }
      const { platform, token, appVersion, deviceInfo } = req.body || {};
      if (!platform || !token) { res.status(400).json({ message: 'platform et token requis' }); return; }
      const device = await service.register(userId, { platform, token, appVersion, deviceInfo });
      res.status(201).json({ message: 'Device enregistré', data: device });
    } catch (e: any) {
      res.status(500).json({ message: e.message || 'Erreur serveur' });
    }
  }

  async list(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) { res.status(401).json({ message: 'Auth requise' }); return; }
      const devices = await service.list(userId);
      res.status(200).json({ message: 'Devices utilisateur', data: devices });
    } catch (e: any) {
      res.status(500).json({ message: e.message || 'Erreur serveur' });
    }
  }

  async remove(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) { res.status(401).json({ message: 'Auth requise' }); return; }
      const { token } = req.params;
      const ok = await service.remove(userId, token);
      res.status(200).json({ success: ok });
    } catch (e: any) {
      res.status(500).json({ message: e.message || 'Erreur serveur' });
    }
  }
}

export default new DevicesController();


