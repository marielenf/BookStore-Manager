import type { LoanData } from "../models/Loan.ts";
import { LoanService } from "../services/LoanService.ts";

type NewLoanData = Omit<LoanData, "id" | "dataDevolucao">;

export class LoanController {
  private readonly loanService: LoanService;

  constructor(loanService: LoanService) {
    this.loanService = loanService;
  }

  async listLoans(): Promise<LoanData[]> {
    return this.loanService.findAll();
  }

  async getLoan(id: number): Promise<LoanData> {
    return this.loanService.findById(id);
  }

  async createLoan(data: NewLoanData): Promise<LoanData> {
    return this.loanService.create(data);
  }

  async registerReturn(id: number, returnDate?: string): Promise<LoanData> {
    return returnDate
      ? this.loanService.registerReturn(id, returnDate)
      : this.loanService.registerReturn(id);
  }
}