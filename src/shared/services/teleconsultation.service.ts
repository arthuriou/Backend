import crypto from 'crypto';
import { TeleconsultationInfo, CreateTeleconsultationRequest } from '../../features/rendezvous/rendezvous.model';

export class TeleconsultationService {
  private readonly JITSI_DOMAIN: string;
  private readonly JITSI_APP_ID: string;
  private readonly JITSI_SECRET: string;

  constructor() {
    this.JITSI_DOMAIN = process.env.JITSI_DOMAIN || 'meet.jit.si';
    this.JITSI_APP_ID = process.env.JITSI_APP_ID || '';
    this.JITSI_SECRET = process.env.JITSI_SECRET || '';
  }

  /**
   * Génère une salle virtuelle sécurisée pour une téléconsultation
   */
  async createTeleconsultationRoom(request: CreateTeleconsultationRequest): Promise<TeleconsultationInfo> {
    const { rendezvous_id, duree_minutes = 60 } = request;
    
    // Générer un ID de salle unique et sécurisé
    const salle_virtuelle = `rdv-${rendezvous_id}-${crypto.randomBytes(8).toString('hex')}`;
    
    // Générer un token d'accès temporaire
    const token_acces = this.generateAccessToken(rendezvous_id, duree_minutes);
    
    // Construire le lien vidéo
    const lien_video = this.buildVideoLink(salle_virtuelle, token_acces);
    
    // Date d'expiration (duree_minutes après maintenant)
    const date_expiration = new Date();
    date_expiration.setMinutes(date_expiration.getMinutes() + duree_minutes);

    return {
      salle_virtuelle,
      lien_video,
      token_acces,
      date_expiration
    };
  }

  /**
   * Génère un token d'accès sécurisé pour la salle
   */
  private generateAccessToken(rendezvous_id: string, duree_minutes: number): string {
    const payload = {
      rendezvous_id,
      exp: Math.floor(Date.now() / 1000) + (duree_minutes * 60),
      iat: Math.floor(Date.now() / 1000)
    };

    // Si Jitsi est configuré avec un secret, utiliser JWT
    if (this.JITSI_SECRET) {
      return this.generateJWTToken(payload);
    }

    // Sinon, générer un token simple
    return crypto.createHash('sha256')
      .update(JSON.stringify(payload))
      .digest('hex')
      .substring(0, 32);
  }

  /**
   * Génère un token JWT pour Jitsi (si configuré)
   */
  private generateJWTToken(payload: any): string {
    const header = {
      alg: 'HS256',
      typ: 'JWT'
    };

    const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
    
    const signature = crypto
      .createHmac('sha256', this.JITSI_SECRET)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest('base64url');

    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  /**
   * Construit le lien vidéo complet
   */
  private buildVideoLink(salle_virtuelle: string, token_acces: string): string {
    const baseUrl = `https://${this.JITSI_DOMAIN}`;
    
    // Paramètres pour la salle
    const params = new URLSearchParams({
      jwt: token_acces,
      config: JSON.stringify({
        startWithAudioMuted: true,
        startWithVideoMuted: false,
        enableWelcomePage: false,
        prejoinPageEnabled: false,
        disableModeratorIndicator: false,
        startScreenSharing: false,
        enableEmailInStats: false
      }),
      interfaceConfig: JSON.stringify({
        TOOLBAR_BUTTONS: [
          'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
          'fodeviceselection', 'hangup', 'profile', 'chat', 'recording',
          'livestreaming', 'etherpad', 'sharedvideo', 'settings', 'raisehand',
          'videoquality', 'filmstrip', 'invite', 'feedback', 'stats', 'shortcuts',
          'tileview', 'videobackgroundblur', 'download', 'help', 'mute-everyone'
        ],
        SETTINGS_SECTIONS: ['devices', 'language', 'moderator', 'profile', 'calendar'],
        SHOW_JITSI_WATERMARK: false,
        SHOW_WATERMARK_FOR_GUESTS: false,
        SHOW_BRAND_WATERMARK: false,
        SHOW_POWERED_BY: false
      })
    });

    return `${baseUrl}/${salle_virtuelle}?${params.toString()}`;
  }

  /**
   * Valide un token d'accès
   */
  validateAccessToken(token: string, rendezvous_id: string): boolean {
    try {
      if (this.JITSI_SECRET) {
        // Valider JWT
        return this.validateJWTToken(token, rendezvous_id);
      } else {
        // Valider token simple
        return this.validateSimpleToken(token, rendezvous_id);
      }
    } catch (error) {
      console.error('Erreur validation token:', error);
      return false;
    }
  }

  /**
   * Valide un token JWT
   */
  private validateJWTToken(token: string, rendezvous_id: string): boolean {
    const parts = token.split('.');
    if (parts.length !== 3) return false;

    const [header, payload, signature] = parts;
    
    // Vérifier la signature
    const expectedSignature = crypto
      .createHmac('sha256', this.JITSI_SECRET)
      .update(`${header}.${payload}`)
      .digest('base64url');

    if (signature !== expectedSignature) return false;

    // Vérifier le payload
    const decodedPayload = JSON.parse(Buffer.from(payload, 'base64url').toString());
    
    return decodedPayload.rendezvous_id === rendezvous_id && 
           decodedPayload.exp > Math.floor(Date.now() / 1000);
  }

  /**
   * Valide un token simple
   */
  private validateSimpleToken(token: string, rendezvous_id: string): boolean {
    // Pour les tokens simples, on peut stocker les tokens valides en base
    // ou utiliser une logique de validation basée sur le hash
    return token.length === 32; // Validation basique
  }

  /**
   * Génère un lien de test pour développement
   */
  generateTestLink(rendezvous_id: string): string {
    const salle_virtuelle = `test-rdv-${rendezvous_id}`;
    return `https://${this.JITSI_DOMAIN}/${salle_virtuelle}`;
  }

  /**
   * Obtient les informations de configuration Jitsi
   */
  getJitsiConfig(): { domain: string; appId: string; configured: boolean } {
    return {
      domain: this.JITSI_DOMAIN,
      appId: this.JITSI_APP_ID,
      configured: !!(this.JITSI_APP_ID && this.JITSI_SECRET)
    };
  }
}
