import type { Interface } from "node:readline/promises";
import { BookController } from "../controllers/BookController.ts";
import type { BookData } from "../models/Book.ts";
import {
  promptInteger,
  promptOptionalInteger,
  promptOptionalText,
  promptText,
  runSafely,
} from "../utils/input.ts";

export class BookMenu {
  private readonly controller: BookController;
  private readonly terminal: Interface;

  constructor(controller: BookController, terminal: Interface) {
    this.controller = controller;
    this.terminal = terminal;
  }

  async run(): Promise<void> {
    let active = true;
    this.terminal.once("close", () => {
      active = false;
    });

    while (active) {
      console.log("\nLivros\n1. Listar\n2. Consultar por ID\n3. Cadastrar\n4. Atualizar\n5. Remover\n0. Voltar");
      await runSafely(async () => {
        const option = await promptInteger(this.terminal, "Escolha uma opção");
        if (option === 0) {
          active = false;
          return;
        }

        switch (option) {
          case 1:
            await this.listBooks();
            break;
          case 2:
            await this.showBook(await this.controller.getBook(await promptInteger(this.terminal, "ID do livro")));
            break;
          case 3:
            await this.showBook(await this.controller.createBook(await this.promptBookData()));
            break;
          case 4: {
            const id = await promptInteger(this.terminal, "ID do livro");
            const current = await this.controller.getBook(id);
            await this.showBook(await this.controller.updateBook(id, await this.promptBookData(current)));
            break;
          }
          case 5:
            await this.controller.deleteBook(await promptInteger(this.terminal, "ID do livro"));
            console.log("Livro removido.");
            break;
          default:
            console.log("Opção inválida.");
        }
      });
    }
  }

  private async listBooks(): Promise<void> {
    const books = await this.controller.listBooks();
    const rows = await Promise.all(
      books.map(async (book) => ({
        ...book,
        exemplaresDisponiveis: await this.controller.getAvailableQuantity(book.id),
      })),
    );
    console.table(rows);
  }

  private async showBook(book: BookData): Promise<void> {
    console.table([{ ...book, exemplaresDisponiveis: await this.controller.getAvailableQuantity(book.id) }]);
  }

  private async promptBookData(current?: BookData): Promise<Omit<BookData, "id">> {
    return {
      titulo: await promptText(this.terminal, "Título", current?.titulo),
      isbn: await promptOptionalText(this.terminal, "ISBN", current?.isbn ?? null),
      anoPublicacao: await promptOptionalInteger(this.terminal, "Ano de publicação", current?.anoPublicacao ?? null),
      quantidadeExemplares: await promptInteger(this.terminal, "Quantidade de exemplares", current?.quantidadeExemplares),
      autorId: await promptInteger(this.terminal, "ID do autor", current?.autorId),
    };
  }
}