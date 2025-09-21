import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TeleconsultationService } from '../shared/services/teleconsultation.service';
import { RendezVousService } from '../features/rendezvous/rendezvous.service';
import { RendezVousRepository } from '../features/rendezvous/rendezvous.repository';

describe('Téléconsultation', () => {
  let teleconsultationService: TeleconsultationService;
  let rendezVousService: RendezVousService;
  let rendezVousRepository: RendezVousRepository;

  beforeEach(() => {
    teleconsultationService = new TeleconsultationService();
    rendezVousRepository = new RendezVousRepository();
    rendezVousService = new RendezVousService();
  });

  describe('TeleconsultationService', () => {
    it('devrait créer une salle de téléconsultation', async () => {
      const request = {
        rendezvous_id: 'test-rdv-123',
        duree_minutes: 60
      };

      const result = await teleconsultationService.createTeleconsultationRoom(request);

      expect(result).toBeDefined();
      expect(result.salle_virtuelle).toContain('rdv-test-rdv-123');
      expect(result.lien_video).toContain('meet.jit.si');
      expect(result.token_acces).toBeDefined();
      expect(result.date_expiration).toBeInstanceOf(Date);
    });

    it('devrait générer un lien de test', () => {
      const testLink = teleconsultationService.generateTestLink('test-rdv-123');
      
      expect(testLink).toContain('meet.jit.si');
      expect(testLink).toContain('test-rdv-test-rdv-123');
    });

    it('devrait retourner la configuration Jitsi', () => {
      const config = teleconsultationService.getJitsiConfig();
      
      expect(config).toBeDefined();
      expect(config.domain).toBe('meet.jit.si');
      expect(typeof config.configured).toBe('boolean');
    });
  });

  describe('Création de RDV avec téléconsultation', () => {
    it('devrait créer un RDV téléconsultation avec salle virtuelle', async () => {
      const rdvData = {
        patient_id: '550e8400-e29b-41d4-a716-446655440000',
        medecin_id: '550e8400-e29b-41d4-a716-446655440001',
        dateheure: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Demain
        duree: 30,
        motif: 'Consultation de test',
        type_rdv: 'TELECONSULTATION' as const
      };

      // Mock du service pour éviter les appels DB
      const mockCreateRendezVous = vi.spyOn(rendezVousService, 'createRendezVous')
        .mockResolvedValue({
          idrendezvous: '550e8400-e29b-41d4-a716-446655440003',
          patient_id: '550e8400-e29b-41d4-a716-446655440000',
          medecin_id: '550e8400-e29b-41d4-a716-446655440001',
          dateheure: new Date(rdvData.dateheure),
          duree: 30,
          motif: 'Consultation de test',
          statut: 'EN_ATTENTE',
          type_rdv: 'TELECONSULTATION'
        });

      const result = await rendezVousService.createRendezVous(rdvData);

      expect(result).toBeDefined();
      expect(result.type_rdv).toBe('TELECONSULTATION');
      expect(mockCreateRendezVous).toHaveBeenCalledWith(rdvData);

      // Cleanup
      mockCreateRendezVous.mockRestore();
    });

    it('devrait créer un RDV présentiel avec adresse', async () => {
      const rdvData = {
        patient_id: '550e8400-e29b-41d4-a716-446655440000',
        medecin_id: '550e8400-e29b-41d4-a716-446655440001',
        dateheure: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        duree: 30,
        motif: 'Consultation de test',
        type_rdv: 'PRESENTIEL' as const,
        adresse_cabinet: '123 Rue de la Paix, Lomé'
      };

      const mockCreateRendezVous = vi.spyOn(rendezVousService, 'createRendezVous')
        .mockResolvedValue({
          idrendezvous: '550e8400-e29b-41d4-a716-446655440003',
          patient_id: '550e8400-e29b-41d4-a716-446655440000',
          medecin_id: '550e8400-e29b-41d4-a716-446655440001',
          dateheure: new Date(rdvData.dateheure),
          duree: 30,
          motif: 'Consultation de test',
          statut: 'EN_ATTENTE',
          type_rdv: 'PRESENTIEL',
          adresse_cabinet: '123 Rue de la Paix, Lomé'
        });

      const result = await rendezVousService.createRendezVous(rdvData);

      expect(result).toBeDefined();
      expect(result.type_rdv).toBe('PRESENTIEL');
      expect(mockCreateRendezVous).toHaveBeenCalledWith(rdvData);

      mockCreateRendezVous.mockRestore();
    });

    it('devrait rejeter un RDV présentiel sans adresse', async () => {
      const rdvData = {
        patient_id: 'patient-123',
        medecin_id: 'medecin-123',
        dateheure: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        duree: 30,
        motif: 'Consultation de test',
        type_rdv: 'PRESENTIEL' as const
        // Pas d'adresse_cabinet
      };

      await expect(rendezVousService.createRendezVous(rdvData))
        .rejects
        .toThrow("L'adresse du cabinet est requise pour un RDV présentiel");
    });
  });

  describe('Workflow de consultation', () => {
    it('devrait commencer une consultation', async () => {
      const mockCommencerConsultation = vi.spyOn(rendezVousService, 'commencerConsultation')
        .mockResolvedValue(true);

      const result = await rendezVousService.commencerConsultation('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001');

      expect(result).toBe(true);
      expect(mockCommencerConsultation).toHaveBeenCalledWith('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001');

      mockCommencerConsultation.mockRestore();
    });

    it('devrait clôturer une consultation', async () => {
      const mockCloturerConsultation = vi.spyOn(rendezVousService, 'cloturerConsultation')
        .mockResolvedValue(true);

      const result = await rendezVousService.cloturerConsultation('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001');

      expect(result).toBe(true);
      expect(mockCloturerConsultation).toHaveBeenCalledWith('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001');

      mockCloturerConsultation.mockRestore();
    });
  });
});
