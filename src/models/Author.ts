export interface AuthorData {
  readonly id: number;
  nome: string;
  nacionalidade: string | null;
  dataNascimento: string | null;
}

export class Author implements AuthorData {
  readonly id: number;
  nome: string;
  nacionalidade: string | null;
  dataNascimento: string | null;

  constructor(data: AuthorData) {
    this.id = data.id;
    this.nome = data.nome;
    this.nacionalidade = data.nacionalidade;
    this.dataNascimento = data.dataNascimento;
  }
}