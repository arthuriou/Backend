import { DevicesRepository } from "./devices.repository";
import { RegisterDeviceRequest } from "./devices.model";

export class DevicesService {
  private repo: DevicesRepository;
  constructor() { this.repo = new DevicesRepository(); }

  register(userId: string, data: RegisterDeviceRequest) { return this.repo.registerDevice(userId, data); }
  list(userId: string) { return this.repo.listDevices(userId); }
  remove(userId: string, token: string) { return this.repo.deleteDevice(userId, token); }
}


