export interface BookData {
  readonly id: number;
  titulo: string;
  isbn: string | null;
  anoPublicacao: number | null;
  quantidadeExemplares: number;
  autorId: number;
}

export class Book implements BookData {
  readonly id: number;
  titulo: string;
  isbn: string | null;
  anoPublicacao: number | null;
  quantidadeExemplares: number;
  autorId: number;

  constructor(data: BookData) {
    this.id = data.id;
    this.titulo = data.titulo;
    this.isbn = data.isbn;
    this.anoPublicacao = data.anoPublicacao;
    this.quantidadeExemplares = data.quantidadeExemplares;
    this.autorId = data.autorId;
  }
}