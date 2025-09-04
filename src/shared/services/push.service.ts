import db from "../../utils/database";

interface PushPayload {
  title: string;
  body: string;
  data?: Record<string, any>;
}

export class PushService {
  async isPushEnabled(userId: string): Promise<boolean> {
    const r = await db.query(
      `SELECT COALESCE(pushEnabled, false) as enabled FROM preferences_notification WHERE utilisateur_id = $1`,
      [userId]
    );
    return r.rows.length > 0 ? !!r.rows[0].enabled : false;
  }

  async getUserDeviceTokens(userId: string): Promise<Array<{ platform: string; token: string }>> {
    const r = await db.query(
      `SELECT platform, token FROM notification_device WHERE utilisateur_id = $1`,
      [userId]
    );
    return r.rows as Array<{ platform: string; token: string }>;
  }

  async sendToUser(userId: string, payload: PushPayload): Promise<void> {
    const enabled = await this.isPushEnabled(userId);
    if (!enabled) return;
    const devices = await this.getUserDeviceTokens(userId);
    if (devices.length === 0) return;

    // Placeholder sender: integrate Expo/FCM here
    for (const d of devices) {
      // eslint-disable-next-line no-console
      console.log(`[PUSH:${d.platform}] -> ${d.token} | ${payload.title} - ${payload.body}`, payload.data || {});
    }
  }
}


