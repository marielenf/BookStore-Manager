export interface LoanData {
  readonly id: number;
  livroId: number;
  clienteId: number;
  dataEmprestimo: string;
  dataPrevistaDevolucao: string;
  dataDevolucao: string | null;
}

export class Loan implements LoanData {
  readonly id: number;
  livroId: number;
  clienteId: number;
  dataEmprestimo: string;
  dataPrevistaDevolucao: string;
  dataDevolucao: string | null;

  constructor(data: LoanData) {
    this.id = data.id;
    this.livroId = data.livroId;
    this.clienteId = data.clienteId;
    this.dataEmprestimo = data.dataEmprestimo;
    this.dataPrevistaDevolucao = data.dataPrevistaDevolucao;
    this.dataDevolucao = data.dataDevolucao;
  }
}