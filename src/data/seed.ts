import { Author } from "../models/Author.ts";
import { Book } from "../models/Book.ts";
import { Client } from "../models/Client.ts";
import { Loan } from "../models/Loan.ts";

export interface SeedData {
  readonly authors: readonly Author[];
  readonly books: readonly Book[];
  readonly clients: readonly Client[];
  readonly loans: readonly Loan[];
}

export function createSeedData(): SeedData {
  return {
    authors: [
      new Author({
        id: 1,
        nome: "Machado de Assis",
        nacionalidade: "Brasileira",
        dataNascimento: "1839-06-21",
      }),
      new Author({
        id: 2,
        nome: "Antoine de Saint-Exupéry",
        nacionalidade: "Francesa",
        dataNascimento: "1900-06-29",
      }),
      new Author({
        id: 3,
        nome: "Carolina Maria de Jesus",
        nacionalidade: "Brasileira",
        dataNascimento: "1914-03-14",
      }),
      new Author({
        id: 4,
        nome: "Jorge Amado",
        nacionalidade: "Brasileira",
        dataNascimento: "1912-08-10",
      }),
      new Author({
        id: 5,
        nome: "Clarice Lispector",
        nacionalidade: "Brasileira",
        dataNascimento: "1920-12-10",
      }),
    ],
    books: [
      new Book({
        id: 1,
        titulo: "Dom Casmurro",
        isbn: "9788535910663",
        anoPublicacao: 1899,
        quantidadeExemplares: 2,
        autorId: 1,
      }),
      new Book({
        id: 2,
        titulo: "Memórias Póstumas de Brás Cubas",
        isbn: "9788535910661",
        anoPublicacao: 1881,
        quantidadeExemplares: 1,
        autorId: 1,
      }),
      new Book({
        id: 3,
        titulo: "O Pequeno Príncipe",
        isbn: "9788522031445",
        anoPublicacao: 1943,
        quantidadeExemplares: 2,
        autorId: 2,
      }),
      new Book({
        id: 4,
        titulo: "Quarto de Despejo",
        isbn: "9788508171279",
        anoPublicacao: 1960,
        quantidadeExemplares: 2,
        autorId: 3,
      }),
      new Book({
        id: 5,
        titulo: "Capitães da Areia",
        isbn: "9788535911691",
        anoPublicacao: 1937,
        quantidadeExemplares: 3,
        autorId: 4,
      }),
      new Book({
        id: 6,
        titulo: "A Hora da Estrela",
        isbn: "9786555320354",
        anoPublicacao: 1977,
        quantidadeExemplares: 2,
        autorId: 5,
      }),
    ],
    clients: [
      new Client({
        id: 1,
        nome: "Ana Souza",
        email: "ana.souza@email.com",
        telefone: "48999990001",
        dataCadastro: "2026-10-01",
      }),
      new Client({
        id: 2,
        nome: "Bruno Lima",
        email: "bruno.lima@email.com",
        telefone: "48999990002",
        dataCadastro: "2026-10-02",
      }),
      new Client({
        id: 3,
        nome: "Camila Costa",
        email: "camila.costa@email.com",
        telefone: "48999990003",
        dataCadastro: "2026-10-03",
      }),
      new Client({
        id: 4,
        nome: "Diego Martins",
        email: "diego.martins@email.com",
        telefone: "48999990004",
        dataCadastro: "2026-10-04",
      }),
      new Client({
        id: 5,
        nome: "Elisa Rocha",
        email: "elisa.rocha@email.com",
        telefone: "48999990005",
        dataCadastro: "2026-10-05",
      }),
    ],
    loans: [
      new Loan({
        id: 1,
        livroId: 1,
        clienteId: 1,
        dataEmprestimo: "2026-10-20",
        dataPrevistaDevolucao: "2026-11-03",
        dataDevolucao: "2026-11-02",
      }),
      new Loan({
        id: 2,
        livroId: 1,
        clienteId: 2,
        dataEmprestimo: "2026-11-01",
        dataPrevistaDevolucao: "2026-11-15",
        dataDevolucao: null,
      }),
      new Loan({
        id: 3,
        livroId: 3,
        clienteId: 3,
        dataEmprestimo: "2026-11-03",
        dataPrevistaDevolucao: "2026-11-17",
        dataDevolucao: null,
      }),
      new Loan({
        id: 4,
        livroId: 4,
        clienteId: 4,
        dataEmprestimo: "2026-10-15",
        dataPrevistaDevolucao: "2026-10-29",
        dataDevolucao: "2026-10-28",
      }),
      new Loan({
        id: 5,
        livroId: 4,
        clienteId: 5,
        dataEmprestimo: "2026-11-05",
        dataPrevistaDevolucao: "2026-11-19",
        dataDevolucao: null,
      }),
      new Loan({
        id: 6,
        livroId: 5,
        clienteId: 1,
        dataEmprestimo: "2026-11-06",
        dataPrevistaDevolucao: "2026-11-20",
        dataDevolucao: null,
      }),
    ],
  };
}