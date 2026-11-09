import assert from "node:assert/strict";
import test from "node:test";
import { createSeedData } from "../dist/data/seed.js";
import { AuthorRepository } from "../dist/repositories/AuthorRepository.js";
import { BookRepository } from "../dist/repositories/BookRepository.js";
import { ClientRepository } from "../dist/repositories/ClientRepository.js";
import { LoanRepository } from "../dist/repositories/LoanRepository.js";
import { AuthorService } from "../dist/services/AuthorService.js";
import { BookService } from "../dist/services/BookService.js";
import { ClientService } from "../dist/services/ClientService.js";
import { LoanService } from "../dist/services/LoanService.js";

function createServices() {
  const seed = createSeedData();
  const authorRepository = new AuthorRepository(seed.authors);
  const bookRepository = new BookRepository(seed.books);
  const clientRepository = new ClientRepository(seed.clients);
  const loanRepository = new LoanRepository(seed.loans);

  return {
    authorRepository,
    bookRepository,
    clientRepository,
    loanRepository,
    authorService: new AuthorService(authorRepository, bookRepository),
    bookService: new BookService(bookRepository, authorRepository, loanRepository),
    clientService: new ClientService(clientRepository, loanRepository),
    loanService: new LoanService(loanRepository, bookRepository, clientRepository),
  };
}

test("cliente normaliza e-mail e impede duplicidade sem diferenciar caixa", async () => {
  const { clientService } = createServices();
  const client = await clientService.create({
    nome: " Cliente Novo ",
    email: "NOVO@EXAMPLE.COM",
    telefone: "",
  });

  assert.equal(client.nome, "Cliente Novo");
  assert.equal(client.email, "novo@example.com");
  assert.equal(client.telefone, null);
  await assert.rejects(
    () => clientService.create({ nome: "Duplicado", email: "ANA.SOUZA@email.com", telefone: null }),
    /e-mail/,
  );
});

test("livro exige autor existente, exemplar válido e ISBN único", async () => {
  const { bookService } = createServices();
  await assert.rejects(
    () => bookService.create({ titulo: "Livro", isbn: null, anoPublicacao: 2020, quantidadeExemplares: 1, autorId: 999 }),
    /Autor não encontrado/,
  );
  await assert.rejects(
    () => bookService.create({ titulo: "Livro", isbn: null, anoPublicacao: 2020, quantidadeExemplares: 0, autorId: 1 }),
    /quantidade de exemplares/,
  );
  await assert.rejects(
    () => bookService.create({ titulo: "Duplicado", isbn: "9788535910663", anoPublicacao: 2020, quantidadeExemplares: 1, autorId: 1 }),
    /ISBN/,
  );
});

test("empréstimos respeitam disponibilidade e validam a devolução", async () => {
  const { bookService, loanService } = createServices();
  assert.equal(await bookService.getAvailableQuantity(2), 1);

  const loan = await loanService.create({
    livroId: 2,
    clienteId: 1,
    dataEmprestimo: "2026-11-07",
    dataPrevistaDevolucao: "2026-11-21",
  });
  assert.equal(await bookService.getAvailableQuantity(2), 0);

  await assert.rejects(
    () => loanService.create({
      livroId: 2,
      clienteId: 2,
      dataEmprestimo: "2026-11-07",
      dataPrevistaDevolucao: "2026-11-21",
    }),
    /disponíveis/,
  );
  await assert.rejects(() => loanService.registerReturn(loan.id, "2026-11-06"), /anteceder/);

  await loanService.registerReturn(loan.id, "2026-11-08");
  assert.equal(await bookService.getAvailableQuantity(2), 1);
  await assert.rejects(() => loanService.registerReturn(loan.id), /já foi devolvido/);
});

test("empréstimos podem ser atualizados sem exceder disponibilidade e removidos", async () => {
  const { bookService, loanService } = createServices();
  const extraLoan = await loanService.create({
    livroId: 3,
    clienteId: 1,
    dataEmprestimo: "2026-11-07",
    dataPrevistaDevolucao: "2026-11-21",
  });

  await assert.rejects(
    () => loanService.update(2, {
      livroId: 3,
      clienteId: 2,
      dataEmprestimo: "2026-11-01",
      dataPrevistaDevolucao: "2026-11-15",
      dataDevolucao: null,
    }),
    /disponíveis/,
  );

  const updated = await loanService.update(2, {
    livroId: 1,
    clienteId: 3,
    dataEmprestimo: "2026-11-01",
    dataPrevistaDevolucao: "2026-11-18",
    dataDevolucao: null,
  });
  assert.equal(updated.clienteId, 3);
  assert.equal(updated.dataPrevistaDevolucao, "2026-11-18");

  await loanService.delete(2);
  assert.equal(await bookService.getAvailableQuantity(1), 2);
  await assert.rejects(() => loanService.delete(999), /não encontrado/);

  await loanService.delete(extraLoan.id);
  assert.equal(await bookService.getAvailableQuantity(3), 1);
});

test("exclusões preservam autores, livros e clientes referenciados", async () => {
  const { authorService, bookService, clientService } = createServices();
  await assert.rejects(() => authorService.delete(1), /possui livros/);
  await assert.rejects(() => bookService.delete(1), /histórico de empréstimos/);
  await assert.rejects(() => clientService.delete(1), /histórico de empréstimos/);
});