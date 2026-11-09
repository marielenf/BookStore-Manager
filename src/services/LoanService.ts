import type { LoanData } from "../models/Loan.ts";
import { BookRepository } from "../repositories/BookRepository.ts";
import { ClientRepository } from "../repositories/ClientRepository.ts";
import { LoanRepository } from "../repositories/LoanRepository.ts";
import { getCurrentDateString, isValidDateString } from "../utils/date.ts";

type NewLoanData = Omit<LoanData, "id" | "dataDevolucao">;
type UpdateLoanData = Omit<LoanData, "id">;

export class LoanService {
  private readonly loanRepository: LoanRepository;
  private readonly bookRepository: BookRepository;
  private readonly clientRepository: ClientRepository;

  constructor(
    loanRepository: LoanRepository,
    bookRepository: BookRepository,
    clientRepository: ClientRepository,
  ) {
    this.loanRepository = loanRepository;
    this.bookRepository = bookRepository;
    this.clientRepository = clientRepository;
  }

  async findAll(): Promise<LoanData[]> {
    return this.loanRepository.findAll();
  }

  async findById(id: number): Promise<LoanData> {
    const loan = await this.loanRepository.findById(id);
    if (!loan) {
      throw new Error("Empréstimo não encontrado.");
    }

    return loan;
  }

  async create(data: NewLoanData): Promise<LoanData> {
    const book = await this.validateReferences(data.livroId, data.clienteId);
    this.validateLoanDates(data.dataEmprestimo, data.dataPrevistaDevolucao);

    const loans = await this.loanRepository.findAll();
    const activeLoans = loans.filter(
      (loan) => loan.livroId === book.id && loan.dataDevolucao === null,
    ).length;
    if (book.quantidadeExemplares - activeLoans < 1) {
      throw new Error("Não há exemplares disponíveis para empréstimo.");
    }

    return this.loanRepository.create({ ...data, dataDevolucao: null });
  }

  async update(id: number, data: UpdateLoanData): Promise<LoanData> {
    const currentLoan = await this.loanRepository.findById(id);
    if (!currentLoan) {
      throw new Error("Empréstimo não encontrado.");
    }

    const book = await this.validateReferences(data.livroId, data.clienteId);
    this.validateLoanDates(data.dataEmprestimo, data.dataPrevistaDevolucao);
    this.validateReturnDate(data.dataEmprestimo, data.dataDevolucao);

    if (data.dataDevolucao === null) {
      const loans = await this.loanRepository.findAll();
      const activeLoansForBook = loans.filter(
        (loan) =>
          loan.id !== id &&
          loan.livroId === book.id &&
          loan.dataDevolucao === null,
      ).length;

      if (book.quantidadeExemplares - activeLoansForBook < 1) {
        throw new Error("Não há exemplares disponíveis para este empréstimo.");
      }
    }

    const updatedLoan = await this.loanRepository.update(id, data);
    if (!updatedLoan) {
      throw new Error("Empréstimo não encontrado.");
    }

    return updatedLoan;
  }

  async delete(id: number): Promise<void> {
    const deleted = await this.loanRepository.delete(id);
    if (!deleted) {
      throw new Error("Empréstimo não encontrado.");
    }
  }

  async registerReturn(id: number, returnDate = getCurrentDateString()): Promise<LoanData> {
    const loan = await this.loanRepository.findById(id);
    if (!loan) {
      throw new Error("Empréstimo não encontrado.");
    }

    if (loan.dataDevolucao !== null) {
      throw new Error("Este empréstimo já foi devolvido.");
    }

    if (!isValidDateString(returnDate) || returnDate < loan.dataEmprestimo) {
      throw new Error("A data de devolução deve ser válida e não pode anteceder o empréstimo.");
    }

    const updatedLoan = await this.loanRepository.update(id, {
      livroId: loan.livroId,
      clienteId: loan.clienteId,
      dataEmprestimo: loan.dataEmprestimo,
      dataPrevistaDevolucao: loan.dataPrevistaDevolucao,
      dataDevolucao: returnDate,
    });
    if (!updatedLoan) {
      throw new Error("Empréstimo não encontrado.");
    }

    return updatedLoan;
  }

  private validateLoanDates(loanDate: string, dueDate: string): void {
    if (!isValidDateString(loanDate) || !isValidDateString(dueDate)) {
      throw new Error("As datas do empréstimo devem ser válidas no formato AAAA-MM-DD.");
    }

    if (dueDate < loanDate) {
      throw new Error("A data prevista para devolução não pode anteceder o empréstimo.");
    }
  }

  private async validateReferences(bookId: number, clientId: number) {
    const book = await this.bookRepository.findById(bookId);
    if (!book) {
      throw new Error("Livro não encontrado.");
    }

    if (!(await this.clientRepository.findById(clientId))) {
      throw new Error("Cliente não encontrado.");
    }

    return book;
  }

  private validateReturnDate(loanDate: string, returnDate: string | null): void {
    if (returnDate !== null && (!isValidDateString(returnDate) || returnDate < loanDate)) {
      throw new Error("A data de devolução deve ser válida e não pode anteceder o empréstimo.");
    }
  }
}