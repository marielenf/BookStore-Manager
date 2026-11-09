import { Loan, type LoanData } from "../models/Loan.ts";

type NewLoanData = Omit<LoanData, "id">;

export class LoanRepository {
  private readonly loans = new Map<number, Loan>();
  private nextId: number;

  constructor(initialLoans: readonly Loan[] = []) {
    for (const loan of initialLoans) {
      this.loans.set(loan.id, new Loan(loan));
    }

    this.nextId = Math.max(0, ...this.loans.keys()) + 1;
  }

  async findAll(): Promise<Loan[]> {
    return Array.from(this.loans.values(), (loan) => new Loan(loan));
  }

  async findById(id: number): Promise<Loan | undefined> {
    const loan = this.loans.get(id);
    return loan ? new Loan(loan) : undefined;
  }

  async create(data: NewLoanData): Promise<Loan> {
    const loan = new Loan({ id: this.nextId, ...data });
    this.loans.set(loan.id, loan);
    this.nextId += 1;
    return new Loan(loan);
  }

  async update(id: number, data: NewLoanData): Promise<Loan | undefined> {
    if (!this.loans.has(id)) {
      return undefined;
    }

    const loan = new Loan({ id, ...data });
    this.loans.set(id, loan);
    return new Loan(loan);
  }

  async delete(id: number): Promise<boolean> {
    return this.loans.delete(id);
  }
}