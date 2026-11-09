import type { AuthorData } from "../models/Author.ts";
import { AuthorRepository } from "../repositories/AuthorRepository.ts";
import { BookRepository } from "../repositories/BookRepository.ts";

type AuthorInput = Omit<AuthorData, "id">;

export class AuthorService {
  private readonly authorRepository: AuthorRepository;
  private readonly bookRepository: BookRepository;

  constructor(authorRepository: AuthorRepository, bookRepository: BookRepository) {
    this.authorRepository = authorRepository;
    this.bookRepository = bookRepository;
  }

  async findAll(): Promise<AuthorData[]> {
    return this.authorRepository.findAll();
  }

  async findById(id: number): Promise<AuthorData> {
    const author = await this.authorRepository.findById(id);
    if (!author) {
      throw new Error("Autor não encontrado.");
    }

    return author;
  }

  async create(data: AuthorInput): Promise<AuthorData> {
    const normalizedData = { ...data, nome: data.nome.trim() };
    this.validateName(normalizedData.nome);
    return this.authorRepository.create(normalizedData);
  }

  async update(id: number, data: AuthorInput): Promise<AuthorData> {
    const normalizedData = { ...data, nome: data.nome.trim() };
    this.validateName(normalizedData.nome);

    const author = await this.authorRepository.update(id, normalizedData);
    if (!author) {
      throw new Error("Autor não encontrado.");
    }

    return author;
  }

  async delete(id: number): Promise<void> {
    const author = await this.authorRepository.findById(id);
    if (!author) {
      throw new Error("Autor não encontrado.");
    }

    const books = await this.bookRepository.findAll();
    if (books.some((book) => book.autorId === id)) {
      throw new Error("Não é possível remover um autor que possui livros cadastrados.");
    }

    await this.authorRepository.delete(id);
  }

  private validateName(name: string): void {
    if (!name) {
      throw new Error("O nome do autor é obrigatório.");
    }
  }
}