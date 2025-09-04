import db from "../../utils/database";
import { RegisterDeviceRequest } from "./devices.model";

export class DevicesRepository {
  async registerDevice(userId: string, data: RegisterDeviceRequest): Promise<any> {
    const { platform, token, appVersion, deviceInfo } = data;
    const r = await db.query(
      `INSERT INTO notification_device (utilisateur_id, platform, token, appVersion, deviceInfo)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (utilisateur_id, token)
       DO UPDATE SET platform = EXCLUDED.platform, appVersion = EXCLUDED.appVersion, deviceInfo = EXCLUDED.deviceInfo, dateModification = now()
       RETURNING *`,
      [userId, platform, token, appVersion ?? null, deviceInfo ?? null]
    );
    return r.rows[0];
  }

  async listDevices(userId: string): Promise<any[]> {
    const r = await db.query(`SELECT * FROM notification_device WHERE utilisateur_id = $1 ORDER BY dateModification DESC`, [userId]);
    return r.rows;
  }

  async deleteDevice(userId: string, token: string): Promise<boolean> {
    const r = await db.query(`DELETE FROM notification_device WHERE utilisateur_id = $1 AND token = $2`, [userId, token]);
    return (r.rowCount || 0) > 0;
  }
}


