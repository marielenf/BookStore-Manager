import type { BookData } from "../models/Book.ts";
import { BookService } from "../services/BookService.ts";

type BookInput = Omit<BookData, "id">;

export class BookController {
  private readonly bookService: BookService;

  constructor(bookService: BookService) {
    this.bookService = bookService;
  }

  async listBooks(): Promise<BookData[]> {
    return this.bookService.findAll();
  }

  async getBook(id: number): Promise<BookData> {
    return this.bookService.findById(id);
  }

  async createBook(data: BookInput): Promise<BookData> {
    return this.bookService.create(data);
  }

  async updateBook(id: number, data: BookInput): Promise<BookData> {
    return this.bookService.update(id, data);
  }

  async deleteBook(id: number): Promise<void> {
    await this.bookService.delete(id);
  }

  async getAvailableQuantity(id: number): Promise<number> {
    return this.bookService.getAvailableQuantity(id);
  }
}