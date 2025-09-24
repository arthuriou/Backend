export type ConfirmationMode = 'AUTO' | 'MANUELLE';
export type SlotType = 'PRESENTIEL' | 'TELECONSULTATION' | 'TOUS';

export interface Agenda {
  idagenda: string;
  medecin_id: string;
  cabinet_id?: string | null;
  nom: string;
  visible_en_ligne: boolean;
  default_duration_min: number;
  buffer_before_min: number;
  buffer_after_min: number;
  timezone: string;
  confirmation_mode: ConfirmationMode;
  allow_double_booking: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateAgendaRequest {
  nom: string;
  cabinet_id?: string;
  visible_en_ligne?: boolean;
  default_duration_min?: number;
  buffer_before_min?: number;
  buffer_after_min?: number;
  timezone?: string;
  confirmation_mode?: ConfirmationMode;
  allow_double_booking?: boolean;
}

export interface UpdateAgendaRequest extends Partial<CreateAgendaRequest> {}

export interface AvailabilityRule {
  idrule: string;
  agenda_id: string;
  weekday: number; // 0-6
  start_time: string; // HH:mm:ss or HH:mm
  end_time: string;   // HH:mm:ss or HH:mm
  duration_min: number;
  allowed_types: SlotType;
  start_date?: string | null; // YYYY-MM-DD
  end_date?: string | null;   // YYYY-MM-DD
  created_at: Date;
  updated_at: Date;
}

export interface CreateRuleRequest {
  weekday: number;
  start_time: string;
  end_time: string;
  duration_min: number;
  allowed_types?: SlotType;
  start_date?: string | null;
  end_date?: string | null;
}

export interface AgendaBlock {
  idblock: string;
  agenda_id: string;
  start_at: string; // ISO
  end_at: string;   // ISO
  reason?: string | null;
  created_by: string;
  created_at: Date;
}

export interface CreateBlockRequest {
  start_at: string;
  end_at: string;
  reason?: string;
}

export interface ExtraAvailability {
  idextra: string;
  agenda_id: string;
  start_at: string; // ISO
  end_at: string;   // ISO
  type: Exclude<SlotType, 'TOUS'>;
  visible_en_ligne: boolean;
  created_at: Date;
}

export interface CreateExtraRequest {
  start_at: string;
  end_at: string;
  type: Exclude<SlotType, 'TOUS'>;
  visible_en_ligne?: boolean;
}

export interface SlotComputed {
  start_at: string;
  end_at: string;
  type: Exclude<SlotType, 'TOUS'>;
  visible_en_ligne: boolean;
}



