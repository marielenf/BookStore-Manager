import type { LoanData } from "../models/Loan.ts";
import { LoanService } from "../services/LoanService.ts";

type NewLoanData = Omit<LoanData, "id" | "dataDevolucao">;
type UpdateLoanData = Omit<LoanData, "id">;

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

  async updateLoan(id: number, data: UpdateLoanData): Promise<LoanData> {
    return this.loanService.update(id, data);
  }

  async deleteLoan(id: number): Promise<void> {
    await this.loanService.delete(id);
  }

  async registerReturn(id: number, returnDate?: string): Promise<LoanData> {
    return returnDate
      ? this.loanService.registerReturn(id, returnDate)
      : this.loanService.registerReturn(id);
  }
}