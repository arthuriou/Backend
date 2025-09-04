import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

// Configuration du transporteur email
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
  logger: process.env.SMTP_DEBUG === 'true',
  debug: process.env.SMTP_DEBUG === 'true'
});

// Générer un code OTP
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Envoyer un email OTP
export async function sendOTPEmail(email: string, otp: string, nom: string): Promise<boolean> {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.error('❌ SMTP_USER/SMTP_PASS manquants dans les variables d\'environnement');
      return false;
    }
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject: 'Code de vérification - SantéAfrik',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c5aa0;">SantéAfrik - Vérification de compte</h2>
          <p>Bonjour ${nom},</p>
          <p>Votre code de vérification est :</p>
          <div style="background-color: #f0f0f0; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #2c5aa0; font-size: 32px; margin: 0;">${otp}</h1>
          </div>
          <p>Ce code expire dans 10 minutes.</p>
          <p>Si vous n'avez pas demandé ce code, ignorez cet email.</p>
          <hr style="margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">SantéAfrik - Plateforme médicale du Togo</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ OTP envoyé à ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Erreur envoi email:', error);
    return false;
  }
}

// Envoyer un email de bienvenue
export async function sendWelcomeEmail(email: string, nom: string, type: 'patient' | 'medecin'): Promise<boolean> {
  try {
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject: 'Bienvenue sur SantéAfrik',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c5aa0;">Bienvenue sur SantéAfrik !</h2>
          <p>Bonjour ${nom},</p>
          <p>Votre compte ${type === 'patient' ? 'patient' : 'médecin'} a été créé avec succès.</p>
          ${type === 'medecin' ? '<p><strong>Important :</strong> Votre compte est en attente de validation par le SuperAdmin.</p>' : ''}
          <p>Vous pouvez maintenant vous connecter à la plateforme.</p>
          <hr style="margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">SantéAfrik - Plateforme médicale du Togo</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Email de bienvenue envoyé à ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Erreur envoi email de bienvenue:', error);
    return false;
  }
}

// Tester la connexion SMTP
export async function testSMTPConnection(): Promise<boolean> {
  try {
    await transporter.verify();
    console.log('✅ Connexion SMTP OK');
    return true;
  } catch (error) {
    console.error('❌ Erreur connexion SMTP:', error);
    return false;
  }
}
