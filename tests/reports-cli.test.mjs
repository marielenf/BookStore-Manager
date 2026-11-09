import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { createSeedData } from "../dist/data/seed.js";
import { AuthorRepository } from "../dist/repositories/AuthorRepository.js";
import { BookRepository } from "../dist/repositories/BookRepository.js";
import { ClientRepository } from "../dist/repositories/ClientRepository.js";
import { LoanRepository } from "../dist/repositories/LoanRepository.js";
import { ReportService } from "../dist/services/ReportService.js";

test("relatórios calculam disponibilidade, empréstimos e agregações em memória", async () => {
  const seed = createSeedData();
  const authors = new AuthorRepository(seed.authors);
  const report = new ReportService(
    authors,
    new BookRepository(seed.books),
    new ClientRepository(seed.clients),
    new LoanRepository(seed.loans),
  );

  const available = await report.getAvailableBooks();
  assert.equal(available.length, 6);
  assert.equal(available.find((book) => book.titulo === "Dom Casmurro").exemplaresDisponiveis, 1);
  assert.equal((await report.getBorrowedBooks()).length, 4);

  await authors.create({ nome: "Seed Author", nacionalidade: null, dataNascimento: null });
  const booksByAuthor = await report.getBooksByAuthor();
  assert(booksByAuthor.some((row) => row.autor === "Seed Author" && row.livro === null));

  const loanCounts = await report.getLoanCountsByBook();
  assert.equal(loanCounts.filter((row) => row.quantidadeEmprestimos === 0).length, 2);
  assert.equal(loanCounts.filter((row) => row.quantidadeEmprestimos === 2).length, 2);

  const activeClients = await report.getClientsWithActiveLoans();
  assert.equal(activeClients.length, 4);
  assert(!activeClients.some((row) => row.id === 4));
});

test("CLI navega até relatórios, lista livros disponíveis e encerra", { timeout: 5000 }, async () => {
  const entryPoint = fileURLToPath(new URL("../dist/main.js", import.meta.url));
  const child = spawn(process.execPath, [entryPoint], { stdio: ["pipe", "pipe", "pipe"] });
  let output = "";
  let errors = "";
  const answers = ["5\n", "1\n", "0\n", "0\n"];
  let sent = 0;

  child.stdout.setEncoding("utf8");
  child.stderr.setEncoding("utf8");

  const exit = new Promise((resolve, reject) => {
    child.stdout.on("data", (chunk) => {
      output += chunk;
      const prompts = (output.match(/Escolha uma/g) || []).length;
      if (prompts > sent && sent < answers.length) {
        child.stdin.write(answers[sent]);
        sent += 1;
      }
    });
    child.stderr.on("data", (chunk) => {
      errors += chunk;
    });
    child.on("error", reject);
    child.on("close", resolve);
  });

  const exitCode = await exit;
  assert.equal(exitCode, 0);
  assert(output.includes("Dom Casmurro"));
  assert(output.toLowerCase().includes("encerrada."));
  assert.equal(errors, "");
});