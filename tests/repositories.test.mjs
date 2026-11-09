import assert from "node:assert/strict";
import test from "node:test";
import { createSeedData } from "../dist/data/seed.js";
import { AuthorRepository } from "../dist/repositories/AuthorRepository.js";
import { BookRepository } from "../dist/repositories/BookRepository.js";
import { ClientRepository } from "../dist/repositories/ClientRepository.js";
import { LoanRepository } from "../dist/repositories/LoanRepository.js";

test("repositories inicializam com seeds e mantêm cópias defensivas", async () => {
  const seed = createSeedData();
  const authorRepository = new AuthorRepository(seed.authors);
  const bookRepository = new BookRepository(seed.books);
  const clientRepository = new ClientRepository(seed.clients);
  const loanRepository = new LoanRepository(seed.loans);

  assert.equal((await authorRepository.findAll()).length, 5);
  assert.equal((await bookRepository.findAll()).length, 6);
  assert.equal((await clientRepository.findAll()).length, 5);
  assert.equal((await loanRepository.findAll()).length, 6);

  const returnedAuthor = await authorRepository.findById(1);
  returnedAuthor.nome = "Alteração externa";
  assert.notEqual((await authorRepository.findById(1)).nome, "Alteração externa");
});

test("repositories suportam criação, atualização e exclusão assíncronas", async () => {
  const authorRepository = new AuthorRepository(createSeedData().authors);
  const created = await authorRepository.create({
    nome: "Autor de teste",
    nacionalidade: null,
    dataNascimento: null,
  });

  assert.equal(created.id, 6);
  assert.equal(
    (await authorRepository.update(created.id, {
      nome: "Autor atualizado",
      nacionalidade: null,
      dataNascimento: null,
    })).nome,
    "Autor atualizado",
  );
  assert.equal(await authorRepository.delete(created.id), true);
  assert.equal(await authorRepository.findById(created.id), undefined);
  assert.equal(await authorRepository.delete(999), false);
});