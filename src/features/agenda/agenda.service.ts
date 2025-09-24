import { AgendaRepository } from "./agenda.repository";
import { CreateAgendaRequest, UpdateAgendaRequest, CreateRuleRequest, CreateBlockRequest, CreateExtraRequest, SlotComputed, SlotType, AvailabilityRule, Agenda } from "./agenda.model";
import { RendezVousRepository } from "../rendezvous/rendezvous.repository";

export class AgendaService {
  private repo: AgendaRepository;
  private rdvRepo: RendezVousRepository;

  constructor(repo = new AgendaRepository(), rdvRepo = new RendezVousRepository()) {
    this.repo = repo;
    this.rdvRepo = rdvRepo;
  }

  createAgenda(medecinId: string, data: CreateAgendaRequest) {
    return this.repo.createAgenda(medecinId, data);
  }

  getMyAgendas(medecinId: string) {
    return this.repo.getAgendasByMedecin(medecinId);
  }

  getAgenda(idagenda: string) {
    return this.repo.getAgendaById(idagenda);
  }

  updateAgenda(idagenda: string, data: UpdateAgendaRequest) {
    return this.repo.updateAgenda(idagenda, data);
  }

  deleteAgenda(idagenda: string) {
    return this.repo.deleteAgenda(idagenda);
  }

  // Rules
  createRule(agendaId: string, data: CreateRuleRequest) {
    return this.repo.createRule(agendaId, data);
  }
  getRules(agendaId: string) {
    return this.repo.getRules(agendaId);
  }
  updateRule(ruleId: string, data: Partial<CreateRuleRequest>) {
    return this.repo.updateRule(ruleId, data);
  }
  deleteRule(ruleId: string) {
    return this.repo.deleteRule(ruleId);
  }

  // Blocks
  createBlock(agendaId: string, createdBy: string, data: CreateBlockRequest) {
    return this.repo.createBlock(agendaId, createdBy, data);
  }
  getBlocks(agendaId: string, start?: string, end?: string) {
    return this.repo.getBlocks(agendaId, start, end);
  }
  deleteBlock(blockId: string) {
    return this.repo.deleteBlock(blockId);
  }

  // Extra availability
  createExtra(agendaId: string, data: CreateExtraRequest) {
    return this.repo.createExtra(agendaId, data);
  }
  getExtras(agendaId: string, start?: string, end?: string) {
    return this.repo.getExtras(agendaId, start, end);
  }
  deleteExtra(extraId: string) {
    return this.repo.deleteExtra(extraId);
  }

  // Slots calculés - génération complète basée sur les règles
  async getComputedSlots(agendaId: string, startISO: string, endISO: string, type?: Exclude<SlotType, 'TOUS'>): Promise<SlotComputed[]> {
    const [agenda, rules, extras, blocks] = await Promise.all([
      this.repo.getAgendaById(agendaId),
      this.repo.getRules(agendaId),
      this.repo.getExtras(agendaId, startISO, endISO),
      this.repo.getBlocks(agendaId, startISO, endISO)
    ]);

    if (!agenda) throw new Error('Agenda introuvable');

    const start = new Date(startISO);
    const end = new Date(endISO);

    // Récupérer les RDVs existants pour ce médecin dans la période
    const existingRdvs = await this.rdvRepo.getRendezVousByMedecinAndDateRange(agenda.medecin_id, start, end)
      .then(rdvs => rdvs.filter(r => !['ANNULE', 'TERMINE'].includes(r.statut)).map(r => ({
        start: new Date(r.dateheure),
        end: new Date(new Date(r.dateheure).getTime() + r.duree * 60000) // duree en minutes
      })));

    // Générer les slots depuis les règles de disponibilité
    const ruleBasedSlots: SlotComputed[] = this.generateSlotsFromRules(

rules, start, end, agenda, type);

    // Ajouter les disponibilités exceptionnelles
    const extraSlots: SlotComputed[] = extras
      .filter(e => e.visible_en_ligne && (!type || e.type === type))
      .map(e => ({ start_at: e.start_at, end_at: e.end_at, type: e.type, visible_en_ligne: true }));

    // Combiner et filtrer les conflits
    const allSlots = [...ruleBasedSlots, ...extraSlots];

    const filteredSlots = allSlots.filter(slot => {
      const slotStart = new Date(slot.start_at);
      const slotEnd = new Date(slot.end_at);

      // Vérifier conflits avec blocks
      const blocked = blocks.some(block => {
        const blockStart = new Date(block.start_at);
        const blockEnd = new Date(block.end_at);
        return slotStart < blockEnd && slotEnd > blockStart;
      });

      if (blocked) return false;

      // Vérifier conflits avec RDVs existants
      const conflictingRdv = existingRdvs.some(rdv =>
        slotStart < rdv.end && slotEnd > rdv.start
      );

      return !conflictingRdv;
    });

    return filteredSlots.sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime());
  }

  private generateSlotsFromRules(
    rules: AvailabilityRule[],
    start: Date,
    end: Date,
    agenda: Agenda,
    type?: Exclude<SlotType, 'TOUS'>
  ): SlotComputed[] {
    const slots: SlotComputed[] = [];
    const current = new Date(start);
    const endLimit = new Date(end);

    while (current < endLimit) {
      const dayOfWeek = current.getDay(); // 0 = dimanche, 1 = lundi, etc.
      const rulesForDay = rules.filter(r => 
        r.weekday === dayOfWeek && 
        (!r.start_date || new Date(r.start_date) <= current) &&
        (!r.end_date || new Date(r.end_date) >= current) &&
        (r.allowed_types === 'TOUS' || !type || r.allowed_types === type)
      );

      for (const rule of rulesForDay) {
        const slotType = type || (rule.allowed_types === 'TOUS' ? 'PRESENTIEL' : rule.allowed_types as Exclude<SlotType, 'TOUS'>);
        slots.push(...this.generateSlotsForRule(current, rule, agenda, slotType));
      }

      current.setDate(current.getDate() + 1);
    }

    return slots;
  }

  private generateSlotsForRule(date: Date, rule: AvailabilityRule, agenda: Agenda, slotType: Exclude<SlotType, 'TOUS'>): SlotComputed[] {
    const slots: SlotComputed[] = [];
    const [startHour, startMinute] = rule.start_time.split(':').map(Number);
    const [endHour, endMinute] = rule.end_time.split(':').map(Number);

    const startTime = new Date(date);
    startTime.setHours(startHour, startMinute, 0, 0);

    const endTime = new Date(date);
    endTime.setHours(endHour, endMinute, 0, 0);

    let currentSlotStart = new Date(startTime);
    currentSlotStart.setMinutes(currentSlotStart.getMinutes() + agenda.buffer_before_min);

    while (currentSlotStart.getTime() + rule.duration_min * 60000 <= endTime.getTime()) {
      const slotStart = new Date(currentSlotStart);
      const slotEnd = new Date(slotStart.getTime() + rule.duration_min * 60000);
      slotEnd.setMinutes(slotEnd.getMinutes() + agenda.buffer_after_min);

      slots.push({
        start_at: slotStart.toISOString(),
        end_at: slotEnd.toISOString(),
        type: slotType,
        visible_en_ligne: agenda.visible_en_ligne
      });

      currentSlotStart.setMinutes(currentSlotStart.getMinutes() + rule.duration_min + agenda.buffer_before_min + agenda.buffer_after_min);
    }

    return slots;
  }
}
