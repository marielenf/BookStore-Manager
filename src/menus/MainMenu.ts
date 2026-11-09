import type { Interface } from "node:readline/promises";
import { AuthorMenu } from "./AuthorMenu.ts";
import { BookMenu } from "./BookMenu.ts";
import { ClientMenu } from "./ClientMenu.ts";
import { LoanMenu } from "./LoanMenu.ts";
import { ReportMenu } from "./ReportMenu.ts";
import { promptInteger, runSafely } from "../utils/input.ts";

export class MainMenu {
  private readonly authorMenu: AuthorMenu;
  private readonly bookMenu: BookMenu;
  private readonly clientMenu: ClientMenu;
  private readonly loanMenu: LoanMenu;
  private readonly reportMenu: ReportMenu;
  private readonly terminal: Interface;

  constructor(
    authorMenu: AuthorMenu,
    bookMenu: BookMenu,
    clientMenu: ClientMenu,
    loanMenu: LoanMenu,
    reportMenu: ReportMenu,
    terminal: Interface,
  ) {
    this.authorMenu = authorMenu;
    this.bookMenu = bookMenu;
    this.clientMenu = clientMenu;
    this.loanMenu = loanMenu;
    this.reportMenu = reportMenu;
    this.terminal = terminal;
  }

  async run(): Promise<void> {
    let active = true;
    this.terminal.once("close", () => {
      active = false;
    });

    console.log("BookStore Manager CLI");

    while (active) {
      console.log("\nMenu principal\n1. Autores\n2. Livros\n3. Clientes\n4. Empréstimos\n5. Relatórios\n0. Encerrar");
      await runSafely(async () => {
        const option = await promptInteger(this.terminal, "Escolha uma opção");
        switch (option) {
          case 0:
            active = false;
            break;
          case 1:
            await this.authorMenu.run();
            break;
          case 2:
            await this.bookMenu.run();
            break;
          case 3:
            await this.clientMenu.run();
            break;
          case 4:
            await this.loanMenu.run();
            break;
          case 5:
            await this.reportMenu.run();
            break;
          default:
            console.log("Opção inválida.");
        }
      });
    }

    console.log("Aplicação encerrada.");
  }
}