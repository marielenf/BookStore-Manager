import { Author, type AuthorData } from "../models/Author.ts";

type NewAuthorData = Omit<AuthorData, "id">;

export class AuthorRepository {
  private readonly authors = new Map<number, Author>();
  private nextId: number;

  constructor(initialAuthors: readonly Author[] = []) {
    for (const author of initialAuthors) {
      this.authors.set(author.id, new Author(author));
    }

    this.nextId = Math.max(0, ...this.authors.keys()) + 1;
  }

  async findAll(): Promise<Author[]> {
    return Array.from(this.authors.values(), (author) => new Author(author));
  }

  async findById(id: number): Promise<Author | undefined> {
    const author = this.authors.get(id);
    return author ? new Author(author) : undefined;
  }

  async create(data: NewAuthorData): Promise<Author> {
    const author = new Author({ id: this.nextId, ...data });
    this.authors.set(author.id, author);
    this.nextId += 1;
    return new Author(author);
  }

  async update(id: number, data: NewAuthorData): Promise<Author | undefined> {
    if (!this.authors.has(id)) {
      return undefined;
    }

    const author = new Author({ id, ...data });
    this.authors.set(id, author);
    return new Author(author);
  }

  async delete(id: number): Promise<boolean> {
    return this.authors.delete(id);
  }
}