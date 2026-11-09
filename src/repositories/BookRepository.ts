import { Book, type BookData } from "../models/Book.ts";

type NewBookData = Omit<BookData, "id">;

export class BookRepository {
  private readonly books = new Map<number, Book>();
  private nextId: number;

  constructor(initialBooks: readonly Book[] = []) {
    for (const book of initialBooks) {
      this.books.set(book.id, new Book(book));
    }

    this.nextId = Math.max(0, ...this.books.keys()) + 1;
  }

  async findAll(): Promise<Book[]> {
    return Array.from(this.books.values(), (book) => new Book(book));
  }

  async findById(id: number): Promise<Book | undefined> {
    const book = this.books.get(id);
    return book ? new Book(book) : undefined;
  }

  async create(data: NewBookData): Promise<Book> {
    const book = new Book({ id: this.nextId, ...data });
    this.books.set(book.id, book);
    this.nextId += 1;
    return new Book(book);
  }

  async update(id: number, data: NewBookData): Promise<Book | undefined> {
    if (!this.books.has(id)) {
      return undefined;
    }

    const book = new Book({ id, ...data });
    this.books.set(id, book);
    return new Book(book);
  }

  async delete(id: number): Promise<boolean> {
    return this.books.delete(id);
  }
}