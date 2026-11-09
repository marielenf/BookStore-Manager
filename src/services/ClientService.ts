import type { ClientData } from "../models/Client.ts";
import { ClientRepository } from "../repositories/ClientRepository.ts";
import { LoanRepository } from "../repositories/LoanRepository.ts";
import { getCurrentDateString, isValidDateString } from "../utils/date.ts";

type ClientInput = Omit<ClientData, "id">;
type NewClientInput = Omit<ClientInput, "dataCadastro"> & {
  dataCadastro?: string;
};

export class ClientService {
  private readonly clientRepository: ClientRepository;
  private readonly loanRepository: LoanRepository;

  constructor(clientRepository: ClientRepository, loanRepository: LoanRepository) {
    this.clientRepository = clientRepository;
    this.loanRepository = loanRepository;
  }

  async findAll(): Promise<ClientData[]> {
    return this.clientRepository.findAll();
  }

  async findById(id: number): Promise<ClientData> {
    const client = await this.clientRepository.findById(id);
    if (!client) {
      throw new Error("Cliente não encontrado.");
    }

    return client;
  }

  async create(data: NewClientInput): Promise<ClientData> {
    const normalizedData = this.normalize(data);
    this.validate(normalizedData);

    if (!(await this.isEmailUnique(normalizedData.email))) {
      throw new Error("Já existe um cliente cadastrado com este e-mail.");
    }

    return this.clientRepository.create(normalizedData);
  }

  async update(id: number, data: ClientInput): Promise<ClientData> {
    const existingClient = await this.clientRepository.findById(id);
    if (!existingClient) {
      throw new Error("Cliente não encontrado.");
    }

    const normalizedData = this.normalize(data);
    this.validate(normalizedData);

    if (!(await this.isEmailUnique(normalizedData.email, id))) {
      throw new Error("Já existe um cliente cadastrado com este e-mail.");
    }

    const client = await this.clientRepository.update(id, normalizedData);
    if (!client) {
      throw new Error("Cliente não encontrado.");
    }

    return client;
  }

  async delete(id: number): Promise<void> {
    const client = await this.clientRepository.findById(id);
    if (!client) {
      throw new Error("Cliente não encontrado.");
    }

    const loans = await this.loanRepository.findAll();
    if (loans.some((loan) => loan.clienteId === id)) {
      throw new Error("Não é possível remover um cliente que possui histórico de empréstimos.");
    }

    await this.clientRepository.delete(id);
  }

  private normalize(data: NewClientInput): ClientInput {
    return {
      ...data,
      nome: data.nome.trim(),
      email: data.email.trim().toLowerCase(),
      telefone: data.telefone?.trim() || null,
      dataCadastro: data.dataCadastro ?? getCurrentDateString(),
    };
  }

  private validate(data: ClientInput): void {
    if (!data.nome) {
      throw new Error("O nome do cliente é obrigatório.");
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      throw new Error("Informe um e-mail válido.");
    }

    if (!isValidDateString(data.dataCadastro)) {
      throw new Error("A data de cadastro deve ser uma data válida no formato AAAA-MM-DD.");
    }
  }

  private async isEmailUnique(email: string, excludedId?: number): Promise<boolean> {
    const clients = await this.clientRepository.findAll();
    return clients.every(
      (client) => client.id === excludedId || client.email.toLowerCase() !== email,
    );
  }
}