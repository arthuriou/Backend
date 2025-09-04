import cron from 'node-cron';
import { RendezVousRepository } from '../../features/rendezvous/rendezvous.repository';
import { PushService } from './push.service';

export class SchedulerService {
  private rdvRepo = new RendezVousRepository();
  private push = new PushService();

  start() {
    // Toutes les minutes: traiter les rappels à envoyer dans la prochaine minute
    cron.schedule('* * * * *', async () => {
      try {
        const now = new Date();
        const inOneMinute = new Date(now.getTime() + 60 * 1000);
        // Sélectionner les rappels à envoyer maintenant (PUSH uniquement ici)
        const rows = await this.rdvRepo.queryRaw(`
          SELECT r.idRappel, r.rendezvous_id, rv.patient_id, rv.medecin_id, rv.motif
          FROM rappel r
          JOIN rendezvous rv ON rv.idRendezVous = r.rendezvous_id
          WHERE r.canal = 'PUSH' AND r.envoye = false AND r.dateEnvoi <= $1
        `, [inOneMinute]);

        for (const r of rows) {
          await this.push.sendToUser(r.patient_id, {
            title: 'Rappel de rendez-vous',
            body: r.motif || 'Vous avez un rendez-vous prochainement',
            data: { rendezvous_id: r.rendezvous_id }
          });
          await this.push.sendToUser(r.medecin_id, {
            title: 'Rappel de rendez-vous',
            body: r.motif || 'Vous avez un rendez-vous prochainement',
            data: { rendezvous_id: r.rendezvous_id }
          });
          await this.rdvRepo.queryRaw(`UPDATE rappel SET envoye = true WHERE idRappel = $1`, [r.idRappel]);
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Scheduler error:', e);
      }
    });
  }
}


