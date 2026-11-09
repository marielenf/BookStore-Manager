import type { BookData } from "../models/Book.ts";
import { AuthorRepository } from "../repositories/AuthorRepository.ts";
import { BookRepository } from "../repositories/BookRepository.ts";
import { LoanRepository } from "../repositories/LoanRepository.ts";

type BookInput = Omit<BookData, "id">;

export class BookService {
  private readonly bookRepository: BookRepository;
  private readonly authorRepository: AuthorRepository;
  private readonly loanRepository: LoanRepository;

  constructor(
    bookRepository: BookRepository,
    authorRepository: AuthorRepository,
    loanRepository: LoanRepository,
  ) {
    this.bookRepository = bookRepository;
    this.authorRepository = authorRepository;
    this.loanRepository = loanRepository;
  }

  async findAll(): Promise<BookData[]> {
    return this.bookRepository.findAll();
  }

  async findById(id: number): Promise<BookData> {
    const book = await this.bookRepository.findById(id);
    if (!book) {
      throw new Error("Livro não encontrado.");
    }

    return book;
  }

  async create(data: BookInput): Promise<BookData> {
    const normalizedData = this.normalize(data);
    await this.validate(normalizedData);
    return this.bookRepository.create(normalizedData);
  }

  async update(id: number, data: BookInput): Promise<BookData> {
    const existingBook = await this.bookRepository.findById(id);
    if (!existingBook) {
      throw new Error("Livro não encontrado.");
    }

    const normalizedData = this.normalize(data);
    await this.validate(normalizedData, id);

    const activeLoans = await this.countActiveLoans(id);
    if (normalizedData.quantidadeExemplares < activeLoans) {
      throw new Error("A quantidade de exemplares não pode ser menor que os empréstimos ativos.");
    }

    const book = await this.bookRepository.update(id, normalizedData);
    if (!book) {
      throw new Error("Livro não encontrado.");
    }

    return book;
  }

  async delete(id: number): Promise<void> {
    const book = await this.bookRepository.findById(id);
    if (!book) {
      throw new Error("Livro não encontrado.");
    }

    const loans = await this.loanRepository.findAll();
    if (loans.some((loan) => loan.livroId === id)) {
      throw new Error("Não é possível remover um livro que possui histórico de empréstimos.");
    }

    await this.bookRepository.delete(id);
  }

  async getAvailableQuantity(id: number): Promise<number> {
    const book = await this.findById(id);
    const activeLoans = await this.countActiveLoans(id);
    return book.quantidadeExemplares - activeLoans;
  }

  private normalize(data: BookInput): BookInput {
    return {
      ...data,
      titulo: data.titulo.trim(),
      isbn: data.isbn?.trim() || null,
    };
  }

  private async validate(data: BookInput, excludedId?: number): Promise<void> {
    if (!data.titulo) {
      throw new Error("O título do livro é obrigatório.");
    }

    if (!Number.isInteger(data.quantidadeExemplares) || data.quantidadeExemplares < 1) {
      throw new Error("A quantidade de exemplares deve ser um número inteiro maior que zero.");
    }

    if (data.anoPublicacao !== null && (!Number.isInteger(data.anoPublicacao) || data.anoPublicacao <= 0)) {
      throw new Error("O ano de publicação deve ser um número inteiro positivo.");
    }

    if (!(await this.authorRepository.findById(data.autorId))) {
      throw new Error("Autor não encontrado.");
    }

    if (data.isbn) {
      const books = await this.bookRepository.findAll();
      const duplicate = books.some(
        (book) => book.id !== excludedId && book.isbn === data.isbn,
      );
      if (duplicate) {
        throw new Error("Já existe um livro cadastrado com este ISBN.");
      }
    }
  }

  private async countActiveLoans(bookId: number): Promise<number> {
    const loans = await this.loanRepository.findAll();
    return loans.filter(
      (loan) => loan.livroId === bookId && loan.dataDevolucao === null,
    ).length;
  }
}