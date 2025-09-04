import db from "../../utils/database";
import { Expo, ExpoPushMessage, ExpoPushTicket } from 'expo-server-sdk';

interface PushPayload {
  title: string;
  body: string;
  data?: Record<string, any>;
}

export class PushService {
  private expo = new Expo();
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

    const expoTokens = devices
      .filter(d => d.platform === 'EXPO' || Expo.isExpoPushToken(d.token))
      .map(d => d.token);

    const messages: ExpoPushMessage[] = expoTokens.map(token => ({
      to: token,
      title: payload.title,
      body: payload.body,
      data: payload.data || {},
      sound: 'default'
    }));

    if (messages.length === 0) return;

    const chunks = this.expo.chunkPushNotifications(messages);
    const tickets: ExpoPushTicket[] = [];
    for (const chunk of chunks) {
      try {
        const ticketChunk = await this.expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Expo push error:', error);
      }
    }
  }
}


