import type { Interface } from "node:readline/promises";
import { BookController } from "../controllers/BookController.ts";
import { ClientController } from "../controllers/ClientController.ts";
import { LoanController } from "../controllers/LoanController.ts";
import type { LoanData } from "../models/Loan.ts";
import { promptInteger, promptOptionalText, promptText, runSafely } from "../utils/input.ts";

export class LoanMenu {
  private readonly bookController: BookController;
  private readonly clientController: ClientController;
  private readonly loanController: LoanController;
  private readonly terminal: Interface;

  constructor(
    loanController: LoanController,
    bookController: BookController,
    clientController: ClientController,
    terminal: Interface,
  ) {
    this.loanController = loanController;
    this.bookController = bookController;
    this.clientController = clientController;
    this.terminal = terminal;
  }

  async run(): Promise<void> {
    let active = true;
    this.terminal.once("close", () => {
      active = false;
    });

    while (active) {
      console.log("\nEmpréstimos\n1. Listar\n2. Consultar por ID\n3. Registrar empréstimo\n4. Registrar devolução\n5. Atualizar empréstimo\n6. Remover empréstimo\n0. Voltar");
      await runSafely(async () => {
        const option = await promptInteger(this.terminal, "Escolha uma opção");
        if (option === 0) {
          active = false;
          return;
        }

        switch (option) {
          case 1:
            await this.listLoans();
            break;
          case 2:
            await this.showLoan(await this.loanController.getLoan(await promptInteger(this.terminal, "ID do empréstimo")));
            break;
          case 3:
            await this.showLoan(await this.loanController.createLoan(await this.promptLoanData()));
            break;
          case 4: {
            const id = await promptInteger(this.terminal, "ID do empréstimo");
            const returnDate = await promptOptionalText(this.terminal, "Data de devolução (AAAA-MM-DD)");
            await this.showLoan(await this.loanController.registerReturn(id, returnDate ?? undefined));
            break;
          }
          case 5: {
            const id = await promptInteger(this.terminal, "ID do empréstimo");
            const current = await this.loanController.getLoan(id);
            const updated = await this.loanController.updateLoan(id, await this.promptUpdatedLoanData(current));
            await this.showLoan(updated);
            break;
          }
          case 6:
            await this.loanController.deleteLoan(await promptInteger(this.terminal, "ID do empréstimo"));
            console.log("Empréstimo removido.");
            break;
          default:
            console.log("Opção inválida.");
        }
      });
    }
  }

  private async listLoans(): Promise<void> {
    const loans = await this.loanController.listLoans();
    const rows = await Promise.all(loans.map((loan) => this.toDisplayRow(loan)));
    console.table(rows);
  }

  private async showLoan(loan: LoanData): Promise<void> {
    console.table([await this.toDisplayRow(loan)]);
  }

  private async toDisplayRow(loan: LoanData): Promise<Record<string, string | number>> {
    const [book, client] = await Promise.all([
      this.bookController.getBook(loan.livroId),
      this.clientController.getClient(loan.clienteId),
    ]);

    return {
      id: loan.id,
      livro: book.titulo,
      cliente: client.nome,
      dataEmprestimo: loan.dataEmprestimo,
      dataPrevistaDevolucao: loan.dataPrevistaDevolucao,
      dataDevolucao: loan.dataDevolucao ?? "Ativo",
    };
  }

  private async promptLoanData(): Promise<Omit<LoanData, "id" | "dataDevolucao">> {
    return {
      livroId: await promptInteger(this.terminal, "ID do livro"),
      clienteId: await promptInteger(this.terminal, "ID do cliente"),
      dataEmprestimo: await promptText(this.terminal, "Data do empréstimo (AAAA-MM-DD)"),
      dataPrevistaDevolucao: await promptText(this.terminal, "Data prevista para devolução (AAAA-MM-DD)"),
    };
  }

  private async promptUpdatedLoanData(current: LoanData): Promise<Omit<LoanData, "id">> {
    return {
      livroId: await promptInteger(this.terminal, "ID do livro", current.livroId),
      clienteId: await promptInteger(this.terminal, "ID do cliente", current.clienteId),
      dataEmprestimo: await promptText(this.terminal, "Data do empréstimo (AAAA-MM-DD)", current.dataEmprestimo),
      dataPrevistaDevolucao: await promptText(
        this.terminal,
        "Data prevista para devolução (AAAA-MM-DD)",
        current.dataPrevistaDevolucao,
      ),
      dataDevolucao: await promptOptionalText(
        this.terminal,
        "Data de devolução (AAAA-MM-DD; - limpa)",
        current.dataDevolucao,
      ),
    };
  }
}