import crypto from "crypto";

export class CryptoService {
  private key: Buffer;

  constructor(secretKey?: string) {
    const raw = secretKey || process.env.MESSAGES_ENCRYPTION_KEY || "";
    if (!raw) {
      // En dev, on génère une clé éphémère pour éviter les crashs, mais à ne pas utiliser en prod
      this.key = crypto.createHash("sha256").update("dev-key-santeafrik").digest();
    } else {
      // Normaliser la clé vers 32 octets via SHA-256
      this.key = crypto.createHash("sha256").update(raw).digest();
    }
  }

  encryptString(plaintext: string): string {
    const iv = crypto.randomBytes(12); // GCM nonce 96 bits
    const cipher = crypto.createCipheriv("aes-256-gcm", this.key, iv);
    const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
    const authTag = cipher.getAuthTag();
    const payload = {
      v: 1,
      iv: iv.toString("base64"),
      ct: encrypted.toString("base64"),
      tag: authTag.toString("base64"),
    };
    return Buffer.from(JSON.stringify(payload), "utf8").toString("base64");
  }

  decryptString(encoded: string): string {
    try {
      const json = Buffer.from(encoded, "base64").toString("utf8");
      const payload = JSON.parse(json);
      const iv = Buffer.from(payload.iv, "base64");
      const ciphertext = Buffer.from(payload.ct, "base64");
      const authTag = Buffer.from(payload.tag, "base64");
      const decipher = crypto.createDecipheriv("aes-256-gcm", this.key, iv);
      decipher.setAuthTag(authTag);
      const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
      return decrypted.toString("utf8");
    } catch (e) {
      return "[message_chiffre_invalide]";
    }
  }

  /**
   * Tente de déchiffrer; si la chaîne n'est pas dans notre format chiffré,
   * on la retourne telle quelle (compatibilité anciens messages en clair).
   */
  decryptOrPassThrough(possiblyEncrypted: string | null | undefined): string | null | undefined {
    if (possiblyEncrypted == null) return possiblyEncrypted;
    // Heuristique rapide: nos messages chiffrés sont base64(JSON { v, iv, ct, tag })
    try {
      const json = Buffer.from(possiblyEncrypted, "base64").toString("utf8");
      const payload = JSON.parse(json);
      if (payload && payload.iv && payload.ct && payload.tag) {
        return this.decryptString(possiblyEncrypted);
      }
      // Si ce n'est pas notre format, retourner tel quel
      return possiblyEncrypted;
    } catch {
      // Pas du base64 valide → considérer comme clair
      return possiblyEncrypted;
    }
  }
}



