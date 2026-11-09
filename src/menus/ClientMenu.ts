import type { Interface } from "node:readline/promises";
import { ClientController } from "../controllers/ClientController.ts";
import type { ClientData } from "../models/Client.ts";
import { promptInteger, promptOptionalText, promptText, runSafely } from "../utils/input.ts";

export class ClientMenu {
  private readonly controller: ClientController;
  private readonly terminal: Interface;

  constructor(controller: ClientController, terminal: Interface) {
    this.controller = controller;
    this.terminal = terminal;
  }

  async run(): Promise<void> {
    let active = true;
    this.terminal.once("close", () => {
      active = false;
    });

    while (active) {
      console.log("\nClientes\n1. Listar\n2. Consultar por ID\n3. Cadastrar\n4. Atualizar\n5. Remover\n0. Voltar");
      await runSafely(async () => {
        const option = await promptInteger(this.terminal, "Escolha uma opção");
        if (option === 0) {
          active = false;
          return;
        }

        switch (option) {
          case 1:
            console.table(await this.controller.listClients());
            break;
          case 2:
            console.table([await this.controller.getClient(await promptInteger(this.terminal, "ID do cliente"))]);
            break;
          case 3:
            console.table([await this.controller.createClient(await this.promptNewClientData())]);
            break;
          case 4: {
            const id = await promptInteger(this.terminal, "ID do cliente");
            const current = await this.controller.getClient(id);
            console.table([await this.controller.updateClient(id, await this.promptClientData(current))]);
            break;
          }
          case 5:
            await this.controller.deleteClient(await promptInteger(this.terminal, "ID do cliente"));
            console.log("Cliente removido.");
            break;
          default:
            console.log("Opção inválida.");
        }
      });
    }
  }

  private async promptNewClientData(): Promise<Omit<ClientData, "id" | "dataCadastro">> {
    return {
      nome: await promptText(this.terminal, "Nome"),
      email: await promptText(this.terminal, "E-mail"),
      telefone: await promptOptionalText(this.terminal, "Telefone"),
    };
  }

  private async promptClientData(current: ClientData): Promise<Omit<ClientData, "id">> {
    return {
      nome: await promptText(this.terminal, "Nome", current.nome),
      email: await promptText(this.terminal, "E-mail", current.email),
      telefone: await promptOptionalText(this.terminal, "Telefone", current.telefone),
      dataCadastro: await promptText(this.terminal, "Data de cadastro (AAAA-MM-DD)", current.dataCadastro),
    };
  }
}