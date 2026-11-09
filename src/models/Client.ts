export interface ClientData {
  readonly id: number;
  nome: string;
  email: string;
  telefone: string | null;
  dataCadastro: string;
}

export class Client implements ClientData {
  readonly id: number;
  nome: string;
  email: string;
  telefone: string | null;
  dataCadastro: string;

  constructor(data: ClientData) {
    this.id = data.id;
    this.nome = data.nome;
    this.email = data.email;
    this.telefone = data.telefone;
    this.dataCadastro = data.dataCadastro;
  }
}