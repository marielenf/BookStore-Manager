import type { ClientData } from "../models/Client.ts";
import { ClientService } from "../services/ClientService.ts";

type NewClientInput = Omit<ClientData, "id" | "dataCadastro"> & {
  dataCadastro?: string;
};
type ClientInput = Omit<ClientData, "id">;

export class ClientController {
  private readonly clientService: ClientService;

  constructor(clientService: ClientService) {
    this.clientService = clientService;
  }

  async listClients(): Promise<ClientData[]> {
    return this.clientService.findAll();
  }

  async getClient(id: number): Promise<ClientData> {
    return this.clientService.findById(id);
  }

  async createClient(data: NewClientInput): Promise<ClientData> {
    return this.clientService.create(data);
  }

  async updateClient(id: number, data: ClientInput): Promise<ClientData> {
    return this.clientService.update(id, data);
  }

  async deleteClient(id: number): Promise<void> {
    await this.clientService.delete(id);
  }
}