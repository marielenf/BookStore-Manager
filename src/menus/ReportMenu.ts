import type { Interface } from "node:readline/promises";
import { ReportController } from "../controllers/ReportController.ts";
import { promptInteger, runSafely } from "../utils/input.ts";

export class ReportMenu {
  private readonly controller: ReportController;
  private readonly terminal: Interface;

  constructor(controller: ReportController, terminal: Interface) {
    this.controller = controller;
    this.terminal = terminal;
  }

  async run(): Promise<void> {
    let active = true;
    this.terminal.once("close", () => {
      active = false;
    });

    while (active) {
      console.log("\nRelatórios\n1. Livros disponíveis\n2. Livros emprestados\n3. Livros por autor\n4. Empréstimos por livro\n5. Clientes com empréstimos ativos\n0. Voltar");
      await runSafely(async () => {
        const option = await promptInteger(this.terminal, "Escolha uma opção");
        if (option === 0) {
          active = false;
          return;
        }

        switch (option) {
          case 1:
            console.table(await this.controller.getAvailableBooks());
            break;
          case 2:
            console.table(await this.controller.getBorrowedBooks());
            break;
          case 3:
            console.table(await this.controller.getBooksByAuthor());
            break;
          case 4:
            console.table(await this.controller.getLoanCountsByBook());
            break;
          case 5:
            console.table(await this.controller.getClientsWithActiveLoans());
            break;
          default:
            console.log("Opção inválida.");
        }
      });
    }
  }
}