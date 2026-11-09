# BookStore Manager CLI

Aplicação de terminal para gerenciar autores, livros, clientes e empréstimos. A CLI usa Node.js e TypeScript, organiza o código em camadas e mantém os registros exclusivamente em memória durante a execução.

O PostgreSQL é uma entrega independente do projeto. A aplicação não se conecta ao banco, não executa SQL e não utiliza ORM.

## Objetivo

Permitir o cadastro, consulta, atualização e remoção de autores, livros e clientes, controlar empréstimos e devoluções e apresentar relatórios gerenciais calculados sobre os dados em memória.

## Tecnologias

- Node.js 24 ou superior
- TypeScript 5.9
- npm
- PostgreSQL 18 para execução independente do script de banco
- Test runner nativo do Node.js (`node:test`)

## Requisitos

- Node.js 24 ou superior e npm instalados.
- Terminal compatível com a entrada interativa da CLI.
- PostgreSQL 18 e pgAdmin 4 são necessários somente para executar o projeto do banco de dados separadamente.

Confira as versões instaladas:

```powershell
node --version
npm --version
```

## Instalação e execução

Na raiz do repositório, instale as dependências:

```powershell
npm install
```

Inicie a aplicação em desenvolvimento:

```powershell
npm run dev
```

O modo de desenvolvimento usa a execução de TypeScript disponível no Node.js 24. Para compilar e executar a versão gerada:

```powershell
npm run build
npm start
```

Verifique os tipos e execute a suíte automatizada:

```powershell
npm run typecheck
npm test
```

`npm test` compila o projeto e executa os testes com o runner nativo do Node.js. Nenhuma instalação ou conexão com PostgreSQL é necessária para rodar ou testar a CLI.

## Utilização

Ao iniciar, o menu principal permite acessar:

1. Autores: listar, consultar por ID, cadastrar, atualizar e remover.
2. Livros: listar com disponibilidade calculada, consultar, cadastrar, atualizar e remover.
3. Clientes: listar, consultar por ID, cadastrar, atualizar e remover.
4. Empréstimos: listar, consultar, registrar empréstimo e registrar devolução.
5. Relatórios: consultar os cinco relatórios gerenciais.
0. Encerrar a aplicação.

Os cadastros solicitam os campos pelo terminal. Em atualizações, os valores atuais aparecem como padrão; campos opcionais podem ser mantidos com Enter ou limpos com `-`. Erros de validação são apresentados sem encerrar o programa.

Os registros iniciais incluem 5 autores, 5 clientes, 6 livros e 6 empréstimos, reproduzidos a partir do conjunto de exemplo do SQL. Alterações feitas na CLI duram somente até a aplicação ser encerrada; ao iniciar novamente, os seeds originais são carregados.

## Funcionalidades e regras

- Livro exige um autor previamente cadastrado.
- E-mails de clientes e ISBNs informados não podem ser duplicados.
- A quantidade cadastrada de exemplares deve ser um inteiro positivo.
- Empréstimos exigem livro, cliente e exemplar disponível.
- Empréstimo ativo é aquele cuja data de devolução ainda é nula.
- A devolução não pode ser anterior à data do empréstimo nem ser registrada duas vezes.
- Autores, livros ou clientes com registros relacionados não podem ser removidos, para preservar a integridade em memória.
- Datas são informadas no formato `AAAA-MM-DD`.

A disponibilidade não é armazenada separadamente. É calculada em cada consulta como quantidade de exemplares menos empréstimos ativos.

## Relatórios

O menu de relatórios calcula os resultados a partir dos repositories em memória:

- Livros disponíveis e quantidade de exemplares disponíveis.
- Livros emprestados, com autor, cliente e datas.
- Livros cadastrados por autor.
- Quantidade total de empréstimos por livro, incluindo livros sem empréstimos.
- Clientes com empréstimos ativos.

Esses relatórios da aplicação não executam consultas SQL. As consultas SQL correspondentes ficam no script independente do banco.

## Arquitetura

O fluxo de uma operação segue `Menus → Controllers → Services → Repositories`. Os resultados retornam pelas mesmas camadas.

- `src/main.ts`: carrega os seeds, instancia as camadas e inicia a aplicação.
- `src/menus/`: menus de navegação e interação com o terminal.
- `src/controllers/`: encaminha operações dos menus aos services.
- `src/services/`: regras de negócio, validações e cálculo dos relatórios.
- `src/repositories/`: armazenamento e recuperação assíncronos em `Map` privados; nenhuma outra camada manipula as coleções diretamente.
- `src/models/`: classes e contratos TypeScript das entidades.
- `src/data/seed.ts`: dados iniciais reproduzidos do script SQL.
- `src/utils/`: leitura de entradas, erros de operação e utilitários de datas.
- `tests/`: testes de repositories, regras de negócio, relatórios e fluxo da CLI.
- `database/`: diagrama e script SQL do PostgreSQL, mantidos separados da aplicação.

Estrutura atual:

```text
.
├── database/
│   ├── DER_BookStore.png
│   └── script.sql
├── src/
│   ├── controllers/
│   ├── data/
│   ├── menus/
│   ├── models/
│   ├── repositories/
│   ├── services/
│   ├── utils/
│   └── main.ts
├── tests/
├── package.json
├── tsconfig.json
└── README.md
```

## Banco de dados independente

O DER está em [`database/DER_BookStore.png`](database/DER_BookStore.png) e o script PostgreSQL em [`database/script.sql`](database/script.sql). O script reúne a criação das tabelas, os dados de exemplo e consultas de conferência e relatórios.

O script não é idempotente: execute-o em um banco PostgreSQL vazio, por exemplo, pelo Query Tool do pgAdmin 4. Sua execução é independente da instalação e execução da CLI. A aplicação não possui configuração de conexão, variáveis de ambiente de banco ou dependências PostgreSQL.

## Estrutura de camadas

Repositories expõem métodos assíncronos para operações sobre dados em memória; services também são assíncronos e concentram as regras de domínio. A separação permite substituir a implementação de armazenamento futuramente sem fazer com que menus ou controllers acessem diretamente as coleções.

## Versionamento

O desenvolvimento usa `main` para a versão final, `develop` para integração e branches de funcionalidade como `feat/autores`, `feat/livros`, `feat/clientes`, `feat/emprestimos`, além das branches técnicas necessárias. Commits usam mensagens semânticas; alterações são validadas antes da integração.

## Entrega

- Repositório: [marielenf/BookStore-Manager](https://github.com/marielenf/BookStore-Manager)
- Integrantes: preencher com os nomes da equipe.
- Kanban: adicionar o link do quadro do projeto.
- Vídeo de apresentação: adicionar o link público após a gravação.