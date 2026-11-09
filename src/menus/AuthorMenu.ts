import type { Interface } from "node:readline/promises";
import type { AuthorData } from "../models/Author.ts";
import { AuthorController } from "../controllers/AuthorController.ts";
import { promptInteger, promptOptionalText, promptText, runSafely } from "../utils/input.ts";

export class AuthorMenu {
  private readonly controller: AuthorController;
  private readonly terminal: Interface;

  constructor(controller: AuthorController, terminal: Interface) {
    this.controller = controller;
    this.terminal = terminal;
  }

  async run(): Promise<void> {
    let active = true;
    this.terminal.once("close", () => {
      active = false;
    });

    while (active) {
      console.log("\nAutores\n1. Listar\n2. Consultar por ID\n3. Cadastrar\n4. Atualizar\n5. Remover\n0. Voltar");
      await runSafely(async () => {
        const option = await promptInteger(this.terminal, "Escolha uma opção");
        if (option === 0) {
          active = false;
          return;
        }

        switch (option) {
          case 1:
            console.table(await this.controller.listAuthors());
            break;
          case 2:
            console.table([await this.controller.getAuthor(await promptInteger(this.terminal, "ID do autor"))]);
            break;
          case 3:
            console.table([await this.controller.createAuthor(await this.promptAuthorData())]);
            break;
          case 4: {
            const id = await promptInteger(this.terminal, "ID do autor");
            const current = await this.controller.getAuthor(id);
            console.table([await this.controller.updateAuthor(id, await this.promptAuthorData(current))]);
            break;
          }
          case 5:
            await this.controller.deleteAuthor(await promptInteger(this.terminal, "ID do autor"));
            console.log("Autor removido.");
            break;
          default:
            console.log("Opção inválida.");
        }
      });
    }
  }

  private async promptAuthorData(current?: AuthorData): Promise<Omit<AuthorData, "id">> {
    return {
      nome: await promptText(this.terminal, "Nome", current?.nome),
      nacionalidade: await promptOptionalText(this.terminal, "Nacionalidade", current?.nacionalidade ?? null),
      dataNascimento: await promptOptionalText(this.terminal, "Data de nascimento (AAAA-MM-DD)", current?.dataNascimento ?? null),
    };
  }
}