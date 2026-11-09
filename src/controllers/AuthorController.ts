import type { AuthorData } from "../models/Author.ts";
import { AuthorService } from "../services/AuthorService.ts";

type AuthorInput = Omit<AuthorData, "id">;

export class AuthorController {
  private readonly authorService: AuthorService;

  constructor(authorService: AuthorService) {
    this.authorService = authorService;
  }

  async listAuthors(): Promise<AuthorData[]> {
    return this.authorService.findAll();
  }

  async getAuthor(id: number): Promise<AuthorData> {
    return this.authorService.findById(id);
  }

  async createAuthor(data: AuthorInput): Promise<AuthorData> {
    return this.authorService.create(data);
  }

  async updateAuthor(id: number, data: AuthorInput): Promise<AuthorData> {
    return this.authorService.update(id, data);
  }

  async deleteAuthor(id: number): Promise<void> {
    await this.authorService.delete(id);
  }
}