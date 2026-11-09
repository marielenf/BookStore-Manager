import { ReportService } from "../services/ReportService.ts";

export class ReportController {
  private readonly reportService: ReportService;

  constructor(reportService: ReportService) {
    this.reportService = reportService;
  }

  async getAvailableBooks() {
    return this.reportService.getAvailableBooks();
  }

  async getBorrowedBooks() {
    return this.reportService.getBorrowedBooks();
  }

  async getBooksByAuthor() {
    return this.reportService.getBooksByAuthor();
  }

  async getLoanCountsByBook() {
    return this.reportService.getLoanCountsByBook();
  }

  async getClientsWithActiveLoans() {
    return this.reportService.getClientsWithActiveLoans();
  }
}