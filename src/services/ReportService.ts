import { AuthorRepository } from "../repositories/AuthorRepository.ts";
import { BookRepository } from "../repositories/BookRepository.ts";
import { ClientRepository } from "../repositories/ClientRepository.ts";
import { LoanRepository } from "../repositories/LoanRepository.ts";

export interface AvailableBookReport {
  readonly id: number;
  readonly titulo: string;
  readonly quantidadeExemplares: number;
  readonly emprestimosAtivos: number;
  readonly exemplaresDisponiveis: number;
}

export interface BorrowedBookReport {
  readonly titulo: string;
  readonly autor: string;
  readonly cliente: string;
  readonly dataEmprestimo: string;
  readonly dataPrevistaDevolucao: string;
}

export interface BooksByAuthorReport {
  readonly autor: string;
  readonly livro: string | null;
  readonly anoPublicacao: number | null;
}

export interface LoanCountReport {
  readonly titulo: string;
  readonly quantidadeEmprestimos: number;
}

export interface ActiveLoansByClientReport {
  readonly id: number;
  readonly cliente: string;
  readonly email: string;
  readonly emprestimosAtivos: number;
}

export class ReportService {
  private readonly authorRepository: AuthorRepository;
  private readonly bookRepository: BookRepository;
  private readonly clientRepository: ClientRepository;
  private readonly loanRepository: LoanRepository;

  constructor(
    authorRepository: AuthorRepository,
    bookRepository: BookRepository,
    clientRepository: ClientRepository,
    loanRepository: LoanRepository,
  ) {
    this.authorRepository = authorRepository;
    this.bookRepository = bookRepository;
    this.clientRepository = clientRepository;
    this.loanRepository = loanRepository;
  }

  async getAvailableBooks(): Promise<AvailableBookReport[]> {
    const [books, loans] = await Promise.all([
      this.bookRepository.findAll(),
      this.loanRepository.findAll(),
    ]);

    return books
      .map((book) => {
        const activeLoans = loans.filter(
          (loan) => loan.livroId === book.id && loan.dataDevolucao === null,
        ).length;
        return {
          id: book.id,
          titulo: book.titulo,
          quantidadeExemplares: book.quantidadeExemplares,
          emprestimosAtivos: activeLoans,
          exemplaresDisponiveis: book.quantidadeExemplares - activeLoans,
        };
      })
      .filter((book) => book.exemplaresDisponiveis > 0)
      .sort((first, second) => first.titulo.localeCompare(second.titulo));
  }

  async getBorrowedBooks(): Promise<BorrowedBookReport[]> {
    const [books, authors, clients, loans] = await Promise.all([
      this.bookRepository.findAll(),
      this.authorRepository.findAll(),
      this.clientRepository.findAll(),
      this.loanRepository.findAll(),
    ]);
    const bookById = new Map(books.map((book) => [book.id, book]));
    const authorById = new Map(authors.map((author) => [author.id, author]));
    const clientById = new Map(clients.map((client) => [client.id, client]));

    return loans
      .filter((loan) => loan.dataDevolucao === null)
      .flatMap((loan) => {
        const book = bookById.get(loan.livroId);
        const author = book ? authorById.get(book.autorId) : undefined;
        const client = clientById.get(loan.clienteId);
        if (!book || !author || !client) {
          return [];
        }

        return [{
          titulo: book.titulo,
          autor: author.nome,
          cliente: client.nome,
          dataEmprestimo: loan.dataEmprestimo,
          dataPrevistaDevolucao: loan.dataPrevistaDevolucao,
        }];
      })
      .sort((first, second) => first.dataEmprestimo.localeCompare(second.dataEmprestimo));
  }

  async getBooksByAuthor(): Promise<BooksByAuthorReport[]> {
    const [authors, books] = await Promise.all([
      this.authorRepository.findAll(),
      this.bookRepository.findAll(),
    ]);

    return authors
      .flatMap<BooksByAuthorReport>((author) => {
        const authorBooks = books.filter((book) => book.autorId === author.id);
        if (authorBooks.length === 0) {
          return [{ autor: author.nome, livro: null, anoPublicacao: null }];
        }

        return authorBooks.map((book) => ({
          autor: author.nome,
          livro: book.titulo,
          anoPublicacao: book.anoPublicacao,
        }));
      })
      .sort((first, second) =>
        first.autor.localeCompare(second.autor) || (first.livro ?? "").localeCompare(second.livro ?? ""),
      );
  }

  async getLoanCountsByBook(): Promise<LoanCountReport[]> {
    const [books, loans] = await Promise.all([
      this.bookRepository.findAll(),
      this.loanRepository.findAll(),
    ]);

    return books
      .map((book) => ({
        titulo: book.titulo,
        quantidadeEmprestimos: loans.filter((loan) => loan.livroId === book.id).length,
      }))
      .sort(
        (first, second) =>
          second.quantidadeEmprestimos - first.quantidadeEmprestimos ||
          first.titulo.localeCompare(second.titulo),
      );
  }

  async getClientsWithActiveLoans(): Promise<ActiveLoansByClientReport[]> {
    const [clients, loans] = await Promise.all([
      this.clientRepository.findAll(),
      this.loanRepository.findAll(),
    ]);

    return clients
      .map((client) => ({
        id: client.id,
        cliente: client.nome,
        email: client.email,
        emprestimosAtivos: loans.filter(
          (loan) => loan.clienteId === client.id && loan.dataDevolucao === null,
        ).length,
      }))
      .filter((client) => client.emprestimosAtivos > 0)
      .sort((first, second) => first.cliente.localeCompare(second.cliente));
  }
}