export interface RegisterDeviceRequest {
  platform: 'EXPO' | 'FCM' | 'APNS' | 'WEB';
  token: string;
  appVersion?: string;
  deviceInfo?: string;
}


