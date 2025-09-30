import { Request, Response } from "express";
import { AgendaService } from "./agenda.service";

export class AgendaController {
  private service: AgendaService;

  constructor(service = new AgendaService()) {
    this.service = service;
  }

  // Méthode pour créer automatiquement des agendas pour tous les médecins qui n'en ont pas
  createAgendasForExistingMedecins = async (req: Request, res: Response) => {
    try {
      const { dryRun = false } = req.query; // Pour tester sans créer

      const pool = require("../../shared/database/client");
      const medecins = await pool.query(`
        SELECT m.idmedecin, m.nom, u.email
        FROM medecin m
        JOIN utilisateur u ON m.utilisateur_id = u.idutilisateur
        LEFT JOIN agendas a ON a.medecin_id = m.idmedecin
        WHERE a.idagenda IS NULL
        ORDER BY m.created_at DESC
      `);

      if (dryRun === 'true') {
        return res.json({
          mode: 'DRY_RUN',
          count: medecins.rows.length,
          medecins: medecins.rows.map((m: any) => ({
            id: m.idmedecin,
            nom: m.nom,
            email: m.email
          }))
        });
      }

      const createdAgendas = [];
      const errors = [];

      for (let medecin of medecins.rows) {
        try {
          const agenda = await this.service.createAgenda(medecin.idmedecin, {
            nom: `Agenda ${medecin.nom}`,
            visible_en_ligne: true,
            default_duration_min: 30,
            buffer_before_min: 0,
            buffer_after_min: 0,
            timezone: 'Africa/Abidjan',
            confirmation_mode: 'MANUELLE',
            allow_double_booking: false
          });

          createdAgendas.push({
            medecin_id: medecin.idmedecin,
            medecin_nom: medecin.nom,
            agenda_id: agenda.idagenda,
            agenda_nom: agenda.nom
          });

          console.log(`Agenda créé pour ${medecin.nom}`);
        } catch (error:any) {
          errors.push({
            medecin: medecin.nom,
            error: error.message
          });
        }
      }

      res.json({
        success: createdAgendas.length,
        errors: errors.length,
        created: createdAgendas,
        failed: errors
      });

    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

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
