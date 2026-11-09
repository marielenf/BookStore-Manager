import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { AuthorController } from "./controllers/AuthorController.ts";
import { BookController } from "./controllers/BookController.ts";
import { ClientController } from "./controllers/ClientController.ts";
import { LoanController } from "./controllers/LoanController.ts";
import { ReportController } from "./controllers/ReportController.ts";
import { createSeedData } from "./data/seed.ts";
import { AuthorMenu } from "./menus/AuthorMenu.ts";
import { BookMenu } from "./menus/BookMenu.ts";
import { ClientMenu } from "./menus/ClientMenu.ts";
import { LoanMenu } from "./menus/LoanMenu.ts";
import { MainMenu } from "./menus/MainMenu.ts";
import { ReportMenu } from "./menus/ReportMenu.ts";
import { AuthorRepository } from "./repositories/AuthorRepository.ts";
import { BookRepository } from "./repositories/BookRepository.ts";
import { ClientRepository } from "./repositories/ClientRepository.ts";
import { LoanRepository } from "./repositories/LoanRepository.ts";
import { AuthorService } from "./services/AuthorService.ts";
import { BookService } from "./services/BookService.ts";
import { ClientService } from "./services/ClientService.ts";
import { LoanService } from "./services/LoanService.ts";
import { ReportService } from "./services/ReportService.ts";

const terminal = createInterface({ input: stdin, output: stdout });
const seed = createSeedData();

const authorRepository = new AuthorRepository(seed.authors);
const bookRepository = new BookRepository(seed.books);
const clientRepository = new ClientRepository(seed.clients);
const loanRepository = new LoanRepository(seed.loans);

const authorController = new AuthorController(new AuthorService(authorRepository, bookRepository));
const bookController = new BookController(
	new BookService(bookRepository, authorRepository, loanRepository),
);
const clientController = new ClientController(new ClientService(clientRepository, loanRepository));
const loanController = new LoanController(
	new LoanService(loanRepository, bookRepository, clientRepository),
);
const reportController = new ReportController(
	new ReportService(authorRepository, bookRepository, clientRepository, loanRepository),
);

const application = new MainMenu(
	new AuthorMenu(authorController, terminal),
	new BookMenu(bookController, terminal),
	new ClientMenu(clientController, terminal),
	new LoanMenu(loanController, bookController, clientController, terminal),
	new ReportMenu(reportController, terminal),
	terminal,
);

try {
	await application.run();
} finally {
	terminal.close();
}