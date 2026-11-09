import type { Interface } from "node:readline/promises";

class TerminalInputClosedError extends Error {
  constructor() {
    super("A entrada do terminal foi encerrada.");
    this.name = "TerminalInputClosedError";
  }
}

async function askQuestion(terminal: Interface, message: string): Promise<string> {
  let closeHandler: () => void = () => undefined;
  const closed = new Promise<string>((_resolve, reject) => {
    closeHandler = () => reject(new TerminalInputClosedError());
    terminal.once("close", closeHandler);
  });

  try {
    return await Promise.race([terminal.question(message), closed]);
  } finally {
    terminal.off("close", closeHandler);
  }
}

export async function promptText(
  terminal: Interface,
  message: string,
  defaultValue?: string,
): Promise<string> {
  const suffix = defaultValue === undefined ? ": " : ` (${defaultValue}): `;
  const answer = (await askQuestion(terminal, `${message}${suffix}`)).trim();
  return answer || defaultValue || "";
}

export async function promptOptionalText(
  terminal: Interface,
  message: string,
  defaultValue: string | null = null,
): Promise<string | null> {
  const suffix = defaultValue === null ? " (opcional): " : ` (${defaultValue}; - limpa): `;
  const answer = (await askQuestion(terminal, `${message}${suffix}`)).trim();
  if (answer === "-") {
    return null;
  }

  return answer || defaultValue;
}

export async function promptInteger(
  terminal: Interface,
  message: string,
  defaultValue?: number,
): Promise<number> {
  const suffix = defaultValue === undefined ? ": " : ` (${defaultValue}): `;
  const answer = (await askQuestion(terminal, `${message}${suffix}`)).trim();
  const value = answer ? Number(answer) : defaultValue;

  if (value === undefined || !Number.isInteger(value)) {
    throw new Error("Informe um número inteiro válido.");
  }

  return value;
}

export async function promptOptionalInteger(
  terminal: Interface,
  message: string,
  defaultValue: number | null = null,
): Promise<number | null> {
  const suffix = defaultValue === null ? " (opcional): " : ` (${defaultValue}; - limpa): `;
  const answer = (await askQuestion(terminal, `${message}${suffix}`)).trim();
  if (answer === "-") {
    return null;
  }

  if (!answer) {
    return defaultValue;
  }

  const value = Number(answer);
  if (!Number.isInteger(value)) {
    throw new Error("Informe um número inteiro válido.");
  }

  return value;
}

export async function runSafely(operation: () => Promise<void>): Promise<void> {
  try {
    await operation();
  } catch (error) {
    if (error instanceof TerminalInputClosedError) {
      return;
    }

    const message = error instanceof Error ? error.message : "Ocorreu um erro inesperado.";
    console.error(`Erro: ${message}`);
  }
}