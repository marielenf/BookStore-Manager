import { Client, type ClientData } from "../models/Client.ts";

type NewClientData = Omit<ClientData, "id">;

export class ClientRepository {
  private readonly clients = new Map<number, Client>();
  private nextId: number;

  constructor(initialClients: readonly Client[] = []) {
    for (const client of initialClients) {
      this.clients.set(client.id, new Client(client));
    }

    this.nextId = Math.max(0, ...this.clients.keys()) + 1;
  }

  async findAll(): Promise<Client[]> {
    return Array.from(this.clients.values(), (client) => new Client(client));
  }

  async findById(id: number): Promise<Client | undefined> {
    const client = this.clients.get(id);
    return client ? new Client(client) : undefined;
  }

  async create(data: NewClientData): Promise<Client> {
    const client = new Client({ id: this.nextId, ...data });
    this.clients.set(client.id, client);
    this.nextId += 1;
    return new Client(client);
  }

  async update(id: number, data: NewClientData): Promise<Client | undefined> {
    if (!this.clients.has(id)) {
      return undefined;
    }

    const client = new Client({ id, ...data });
    this.clients.set(id, client);
    return new Client(client);
  }

  async delete(id: number): Promise<boolean> {
    return this.clients.delete(id);
  }
}