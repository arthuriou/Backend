import pool from "../../shared/database/client";
import { Agenda, CreateAgendaRequest, UpdateAgendaRequest, AvailabilityRule, CreateRuleRequest, AgendaBlock, CreateBlockRequest, ExtraAvailability, CreateExtraRequest } from "./agenda.model";

export class AgendaRepository {
  async createAgenda(medecinId: string, data: CreateAgendaRequest): Promise<Agenda> {
    const {
      nom,
      cabinet_id = null,
      visible_en_ligne = true,
      default_duration_min = 30,
      buffer_before_min = 0,
      buffer_after_min = 0,
      timezone = 'Africa/Abidjan',
      confirmation_mode = 'MANUELLE',
      allow_double_booking = false,
    } = data;

    const result = await pool.query(
      `INSERT INTO agendas (
        medecin_id, cabinet_id, nom, visible_en_ligne, default_duration_min,
        buffer_before_min, buffer_after_min, timezone, confirmation_mode, allow_double_booking
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      RETURNING *`,
      [
        medecinId, cabinet_id, nom, visible_en_ligne, default_duration_min,
        buffer_before_min, buffer_after_min, timezone, confirmation_mode, allow_double_booking
      ]
    );
    return result.rows[0];
  }

  async getAgendasByMedecin(medecinId: string): Promise<Agenda[]> {
    const result = await pool.query(`SELECT * FROM agendas WHERE medecin_id = $1 ORDER BY created_at DESC`, [medecinId]);
    return result.rows;
  }

  async getAgendaById(idagenda: string): Promise<Agenda | null> {
    const result = await pool.query(`SELECT * FROM agendas WHERE idagenda = $1`, [idagenda]);
    return result.rows[0] || null;
  }

  async updateAgenda(idagenda: string, data: UpdateAgendaRequest): Promise<Agenda | null> {
    // Simple dynamic update
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;
    for (const [key, value] of Object.entries(data)) {
      fields.push(`${key} = $${idx++}`);
      values.push(value);
    }
    if (fields.length === 0) return await this.getAgendaById(idagenda);
    values.push(idagenda);
    const result = await pool.query(`UPDATE agendas SET ${fields.join(', ')}, updated_at = NOW() WHERE idagenda = $${idx} RETURNING *`, values);
    return result.rows[0] || null;
  }

  async deleteAgenda(idagenda: string): Promise<void> {
    await pool.query(`DELETE FROM agendas WHERE idagenda = $1`, [idagenda]);
  }

  // Rules
  async createRule(agendaId: string, data: CreateRuleRequest): Promise<AvailabilityRule> {
    const { weekday, start_time, end_time, duration_min, allowed_types = 'TOUS', start_date = null, end_date = null } = data;
    const result = await pool.query(
      `INSERT INTO availability_rules (agenda_id, weekday, start_time, end_time, duration_min, allowed_types, start_date, end_date)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [agendaId, weekday, start_time, end_time, duration_min, allowed_types, start_date, end_date]
    );
    return result.rows[0];
  }

  async getRules(agendaId: string): Promise<AvailabilityRule[]> {
    const result = await pool.query(`SELECT * FROM availability_rules WHERE agenda_id = $1 ORDER BY weekday, start_time`, [agendaId]);
    return result.rows;
  }

  async updateRule(ruleId: string, data: Partial<CreateRuleRequest>): Promise<AvailabilityRule | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;
    for (const [key, value] of Object.entries(data)) {
      fields.push(`${key} = $${idx++}`);
      values.push(value);
    }
    if (fields.length === 0) {
      const res = await pool.query(`SELECT * FROM availability_rules WHERE idrule = $1`, [ruleId]);
      return res.rows[0] || null;
    }
    values.push(ruleId);
    const result = await pool.query(`UPDATE availability_rules SET ${fields.join(', ')}, updated_at = NOW() WHERE idrule = $${idx} RETURNING *`, values);
    return result.rows[0] || null;
  }

  async deleteRule(ruleId: string): Promise<void> {
    await pool.query(`DELETE FROM availability_rules WHERE idrule = $1`, [ruleId]);
  }

  // Blocks
  async createBlock(agendaId: string, createdBy: string, data: CreateBlockRequest): Promise<AgendaBlock> {
    const { start_at, end_at, reason = null } = data;
    const result = await pool.query(
      `INSERT INTO agenda_blocks (agenda_id, start_at, end_at, reason, created_by)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [agendaId, start_at, end_at, reason, createdBy]
    );
    return result.rows[0];
  }

  async getBlocks(agendaId: string, start?: string, end?: string): Promise<AgendaBlock[]> {
    if (start && end) {
      const result = await pool.query(
        `SELECT * FROM agenda_blocks WHERE agenda_id = $1 AND NOT ($3 <= start_at OR $2 >= end_at) ORDER BY start_at`,
        [agendaId, start, end]
      );
      return result.rows;
    }
    const result = await pool.query(`SELECT * FROM agenda_blocks WHERE agenda_id = $1 ORDER BY start_at`, [agendaId]);
    return result.rows;
  }

  async deleteBlock(blockId: string): Promise<void> {
    await pool.query(`DELETE FROM agenda_blocks WHERE idblock = $1`, [blockId]);
  }

  // Extra availability
  async createExtra(agendaId: string, data: CreateExtraRequest): Promise<ExtraAvailability> {
    const { start_at, end_at, type, visible_en_ligne = true } = data;
    const result = await pool.query(
      `INSERT INTO extra_availability (agenda_id, start_at, end_at, type, visible_en_ligne)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [agendaId, start_at, end_at, type, visible_en_ligne]
    );
    return result.rows[0];
  }

  async getExtras(agendaId: string, start?: string, end?: string): Promise<ExtraAvailability[]> {
    if (start && end) {
      const result = await pool.query(
        `SELECT * FROM extra_availability WHERE agenda_id = $1 AND NOT ($3 <= start_at OR $2 >= end_at) ORDER BY start_at`,
        [agendaId, start, end]
      );
      return result.rows;
    }
    const result = await pool.query(`SELECT * FROM extra_availability WHERE agenda_id = $1 ORDER BY start_at`, [agendaId]);
    return result.rows;
  }

  async deleteExtra(extraId: string): Promise<void> {
    await pool.query(`DELETE FROM extra_availability WHERE idextra = $1`, [extraId]);
  }
}



