/**
 * Utilitaires pour l'envoi d'emails
 * Gère l'envoi d'OTP et de notifications
 */

// ================================
// CONFIGURATION EMAIL
// ================================

const MAIL_CONFIG = {
  host: process.env.MAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.MAIL_PORT || '587'),
  secure: process.env.MAIL_SECURE === 'true',
  user: process.env.MAIL_USER || '',
  password: process.env.MAIL_PASS || '',
  fromName: process.env.MAIL_FROM_NAME || 'SantéAfrik',
  fromEmail: process.env.MAIL_FROM_EMAIL || 'noreply@santeafrik.com'
};

// ================================
// FONCTIONS D'ENVOI
// ================================

/**
 * Envoie un email OTP
 * @param email - Adresse email du destinataire
 * @param otp - Code OTP à envoyer
 */
export async function sendOTPEmail(email: string, otp: string): Promise<boolean> {
  try {
    // TODO: Implémenter l'envoi réel d'email avec Nodemailer
    // Pour l'instant, on simule l'envoi
    
    console.log(`📧 Email OTP envoyé à ${email}: ${otp}`);
    console.log(`📧 Configuration SMTP: ${MAIL_CONFIG.host}:${MAIL_CONFIG.port}`);
    
    // Simuler un délai d'envoi
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return true;
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email OTP:', error);
    return false;
  }
}

/**
 * Envoie un email de notification
 * @param email - Adresse email du destinataire
 * @param subject - Sujet de l'email
 * @param content - Contenu de l'email
 */
export async function sendNotificationEmail(email: string, subject: string, content: string): Promise<boolean> {
  try {
    // TODO: Implémenter l'envoi réel d'email avec Nodemailer
    
    console.log(`📧 Email de notification envoyé à ${email}`);
    console.log(`📧 Sujet: ${subject}`);
    console.log(`📧 Contenu: ${content.substring(0, 100)}...`);
    
    // Simuler un délai d'envoi
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return true;
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email de notification:', error);
    return false;
  }
}

/**
 * Envoie un email de bienvenue
 * @param email - Adresse email du destinataire
 * @param nom - Nom du destinataire
 * @param typeCompte - Type de compte (PATIENT, MEDECIN, etc.)
 */
export async function sendWelcomeEmail(email: string, nom: string, typeCompte: string): Promise<boolean> {
  try {
    const subject = `Bienvenue sur SantéAfrik, ${nom}!`;
    const content = `
      Bonjour ${nom},
      
      Bienvenue sur SantéAfrik ! Votre compte ${typeCompte.toLowerCase()} a été créé avec succès.
      
      Vous pouvez maintenant vous connecter et profiter de nos services.
      
      Cordialement,
      L'équipe SantéAfrik
    `;
    
    return await sendNotificationEmail(email, subject, content);
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email de bienvenue:', error);
    return false;
  }
}

/**
 * Envoie un email de validation de compte
 * @param email - Adresse email du destinataire
 * @param nom - Nom du destinataire
 * @param typeCompte - Type de compte
 */
export async function sendAccountValidationEmail(email: string, nom: string, typeCompte: string): Promise<boolean> {
  try {
    const subject = `Votre compte ${typeCompte} a été validé - SantéAfrik`;
    const content = `
      Bonjour ${nom},
      
      Excellente nouvelle ! Votre compte ${typeCompte.toLowerCase()} a été validé par nos administrateurs.
      
      Vous pouvez maintenant accéder à toutes les fonctionnalités de la plateforme.
      
      Cordialement,
      L'équipe SantéAfrik
    `;
    
    return await sendNotificationEmail(email, subject, content);
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email de validation:', error);
    return false;
  }
}

/**
 * Envoie un email de réinitialisation de mot de passe
 * @param email - Adresse email du destinataire
 * @param resetToken - Token de réinitialisation
 */
export async function sendPasswordResetEmail(email: string, resetToken: string): Promise<boolean> {
  try {
    const subject = 'Réinitialisation de votre mot de passe - SantéAfrik';
    const content = `
      Bonjour,
      
      Vous avez demandé la réinitialisation de votre mot de passe.
      
      Cliquez sur le lien suivant pour définir un nouveau mot de passe :
      ${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}
      
      Ce lien expire dans 1 heure.
      
      Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.
      
      Cordialement,
      L'équipe SantéAfrik
    `;
    
    return await sendNotificationEmail(email, subject, content);
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email de réinitialisation:', error);
    return false;
  }
}

// ================================
// UTILITAIRES
// ================================

/**
 * Vérifie si la configuration email est valide
 */
export function isEmailConfigValid(): boolean {
  return !!(MAIL_CONFIG.user && MAIL_CONFIG.password);
}

/**
 * Obtient la configuration email (sans le mot de passe)
 */
export function getEmailConfig() {
  return {
    host: MAIL_CONFIG.host,
    port: MAIL_CONFIG.port,
    secure: MAIL_CONFIG.secure,
    user: MAIL_CONFIG.user,
    fromName: MAIL_CONFIG.fromName,
    fromEmail: MAIL_CONFIG.fromEmail
  };
}

// ================================
// EXPORT PAR DÉFAUT
// ================================

export default {
  sendOTPEmail,
  sendNotificationEmail,
  sendWelcomeEmail,
  sendAccountValidationEmail,
  sendPasswordResetEmail,
  isEmailConfigValid,
  getEmailConfig
};
