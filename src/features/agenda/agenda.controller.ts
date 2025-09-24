import { Request, Response } from "express";
import { AgendaService } from "./agenda.service";

export class AgendaController {
  private service: AgendaService;

  constructor(service = new AgendaService()) {
    this.service = service;
  }

  getMyAgendas = async (req: Request, res: Response) => {
    const medecinId = (req as any).user?.idmedecin || (req as any).user?.medecin_id || (req as any).user?.id;
    const agendas = await this.service.getMyAgendas(medecinId);
    res.json(agendas);
  };

  getAgendaById = async (req: Request, res: Response) => {
    const agenda = await this.service.getAgenda(req.params.id);
    if (!agenda) return res.status(404).json({ message: 'Agenda introuvable' });
    res.json(agenda);
  };

  updateAgenda = async (req: Request, res: Response) => {
    const updated = await this.service.updateAgenda(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: 'Agenda introuvable' });
    res.json(updated);
  };

  deleteAgenda = async (req: Request, res: Response) => {
    await this.service.deleteAgenda(req.params.id);
    res.json({ message: 'Agenda supprimé' });
  };

  // Rules
  createRule = async (req: Request, res: Response) => {
    const rule = await this.service.createRule(req.params.id, req.body);
    res.status(201).json(rule);
  };
  getRules = async (req: Request, res: Response) => {
    const rules = await this.service.getRules(req.params.id);
    res.json(rules);
  };
  updateRule = async (req: Request, res: Response) => {
    const rule = await this.service.updateRule(req.params.ruleId, req.body);
    if (!rule) return res.status(404).json({ message: 'Règle introuvable' });
    res.json(rule);
  };
  deleteRule = async (req: Request, res: Response) => {
    await this.service.deleteRule(req.params.ruleId);
    res.json({ message: 'Règle supprimée' });
  };

  // Blocks
  createBlock = async (req: Request, res: Response) => {
    const userId = (req as any).user?.iduser || (req as any).user?.id;
    const block = await this.service.createBlock(req.params.id, userId, req.body);
    res.status(201).json(block);
  };
  getBlocks = async (req: Request, res: Response) => {
    const { start, end } = req.query as any;
    const blocks = await this.service.getBlocks(req.params.id, start, end);
    res.json(blocks);
  };
  deleteBlock = async (req: Request, res: Response) => {
    await this.service.deleteBlock(req.params.blockId);
    res.json({ message: 'Bloc supprimé' });
  };

  // Extras
  createExtra = async (req: Request, res: Response) => {
    const extra = await this.service.createExtra(req.params.id, req.body);
    res.status(201).json(extra);
  };
  getExtras = async (req: Request, res: Response) => {
    const { start, end } = req.query as any;
    const extras = await this.service.getExtras(req.params.id, start, end);
    res.json(extras);
  };
  deleteExtra = async (req: Request, res: Response) => {
    await this.service.deleteExtra(req.params.extraId);
    res.json({ message: 'Extra supprimé' });
  };

  // Slots
  getSlots = async (req: Request, res: Response) => {
    const { start, end, type } = req.query as any;
    if (!start || !end) return res.status(400).json({ message: 'start et end requis' });
    const agenda = await this.service.getAgenda(req.params.id);
    if (!agenda) return res.status(404).json({ message: 'Agenda introuvable' });

    // Pour l'endpoint public, vérifier que l'agenda est visible en ligne
    if (req.path.includes('/public') && !agenda.visible_en_ligne) {
      return res.status(404).json({ message: 'Agenda non disponible' });
    }

    const slots = await this.service.getComputedSlots(req.params.id, start, end, type);
    res.json(slots);
  };
}
