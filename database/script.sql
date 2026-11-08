-- ============================================================
-- BookStore Manager
-- Banco de dados: bookstore_manager
-- PostgreSQL 18
--
-- ============================================================


-- ============================================================
-- 1. DDL - CRIAÇÃO DAS TABELAS
-- Ordem respeita as dependências das chaves estrangeiras.
-- ============================================================

CREATE TABLE autores (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    nacionalidade VARCHAR(80),
    data_nascimento DATE
);

CREATE TABLE clientes (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    telefone VARCHAR(20),
    data_cadastro DATE NOT NULL DEFAULT CURRENT_DATE
);

CREATE TABLE livros (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    isbn VARCHAR(20) UNIQUE,
    ano_publicacao INTEGER CHECK (ano_publicacao > 0),
    quantidade_exemplares INTEGER NOT NULL
        CHECK (quantidade_exemplares >= 1),
    autor_id INTEGER NOT NULL,
    CONSTRAINT fk_livros_autores
        FOREIGN KEY (autor_id)
        REFERENCES autores(id)
);

CREATE TABLE emprestimos (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    livro_id INTEGER NOT NULL,
    cliente_id INTEGER NOT NULL,
    data_emprestimo DATE NOT NULL DEFAULT CURRENT_DATE,
    data_prevista_devolucao DATE NOT NULL,
    data_devolucao DATE,

    CONSTRAINT fk_emprestimos_livros
        FOREIGN KEY (livro_id)
        REFERENCES livros(id),

    CONSTRAINT fk_emprestimos_clientes
        FOREIGN KEY (cliente_id)
        REFERENCES clientes(id),

    CONSTRAINT chk_data_prevista
        CHECK (data_prevista_devolucao >= data_emprestimo),

    CONSTRAINT chk_data_devolucao
        CHECK (
            data_devolucao IS NULL
            OR data_devolucao >= data_emprestimo
        )
);


-- ============================================================
-- 2. DML - DADOS DE EXEMPLO
-- Os mesmos dados devem ser utilizados como referência para
-- os seeds da aplicação CLI.
-- ============================================================

-- 2.1 Autores
INSERT INTO autores (nome, nacionalidade, data_nascimento)
VALUES
    ('Machado de Assis', 'Brasileira', '1839-06-21'),
    ('Antoine de Saint-Exupéry', 'Francesa', '1900-06-29'),
    ('Carolina Maria de Jesus', 'Brasileira', '1914-03-14'),
    ('Jorge Amado', 'Brasileira', '1912-08-10'),
    ('Clarice Lispector', 'Brasileira', '1920-12-10');


-- 2.2 Clientes
INSERT INTO clientes (nome, email, telefone, data_cadastro)
VALUES
    ('Ana Souza', 'ana.souza@email.com', '48999990001', '2026-10-01'),
    ('Bruno Lima', 'bruno.lima@email.com', '48999990002', '2026-10-02'),
    ('Camila Costa', 'camila.costa@email.com', '48999990003', '2026-10-03'),
    ('Diego Martins', 'diego.martins@email.com', '48999990004', '2026-10-04'),
    ('Elisa Rocha', 'elisa.rocha@email.com', '48999990005', '2026-10-05');


-- 2.3 Livros
INSERT INTO livros
    (titulo, isbn, ano_publicacao, quantidade_exemplares, autor_id)
VALUES
    (
        'Dom Casmurro',
        '9788535910663',
        1899,
        2,
        (SELECT id FROM autores WHERE nome = 'Machado de Assis')
    ),
    (
        'Memórias Póstumas de Brás Cubas',
        '9788535910661',
        1881,
        1,
        (SELECT id FROM autores WHERE nome = 'Machado de Assis')
    ),
    (
        'O Pequeno Príncipe',
        '9788522031445',
        1943,
        2,
        (SELECT id FROM autores WHERE nome = 'Antoine de Saint-Exupéry')
    ),
    (
        'Quarto de Despejo',
        '9788508171279',
        1960,
        2,
        (SELECT id FROM autores WHERE nome = 'Carolina Maria de Jesus')
    ),
    (
        'Capitães da Areia',
        '9788535911691',
        1937,
        3,
        (SELECT id FROM autores WHERE nome = 'Jorge Amado')
    ),
    (
        'A Hora da Estrela',
        '9786555320354',
        1977,
        2,
        (SELECT id FROM autores WHERE nome = 'Clarice Lispector')
    );


-- 2.4 Empréstimos
-- Um empréstimo está ativo quando data_devolucao é NULL.
INSERT INTO emprestimos
    (livro_id, cliente_id, data_emprestimo,
     data_prevista_devolucao, data_devolucao)
VALUES
    -- Empréstimo devolvido
    (
        (SELECT id FROM livros WHERE isbn = '9788535910663'),
        (SELECT id FROM clientes WHERE email = 'ana.souza@email.com'),
        '2026-10-20',
        '2026-11-03',
        '2026-11-02'
    ),

    -- Empréstimo ativo
    (
        (SELECT id FROM livros WHERE isbn = '9788535910663'),
        (SELECT id FROM clientes WHERE email = 'bruno.lima@email.com'),
        '2026-11-01',
        '2026-11-15',
        NULL
    ),

    -- Empréstimo ativo
    (
        (SELECT id FROM livros WHERE isbn = '9788522031445'),
        (SELECT id FROM clientes WHERE email = 'camila.costa@email.com'),
        '2026-11-03',
        '2026-11-17',
        NULL
    ),

    -- Empréstimo devolvido
    (
        (SELECT id FROM livros WHERE isbn = '9788508171279'),
        (SELECT id FROM clientes WHERE email = 'diego.martins@email.com'),
        '2026-10-15',
        '2026-10-29',
        '2026-10-28'
    ),

    -- Empréstimo ativo
    (
        (SELECT id FROM livros WHERE isbn = '9788508171279'),
        (SELECT id FROM clientes WHERE email = 'elisa.rocha@email.com'),
        '2026-11-05',
        '2026-11-19',
        NULL
    ),

    -- Empréstimo ativo
    (
        (SELECT id FROM livros WHERE isbn = '9788535911691'),
        (SELECT id FROM clientes WHERE email = 'ana.souza@email.com'),
        '2026-11-06',
        '2026-11-20',
        NULL
    );


-- ============================================================
-- 3. CONSULTAS DE CONFERÊNCIA DOS DADOS
-- ============================================================

-- 3.1 Quantidade de registros por tabela
SELECT 'Autores' AS tabela, COUNT(*) AS quantidade FROM autores
UNION ALL
SELECT 'Clientes', COUNT(*) FROM clientes
UNION ALL
SELECT 'Livros', COUNT(*) FROM livros
UNION ALL
SELECT 'Empréstimos', COUNT(*) FROM emprestimos;


-- 3.2 Listagem de empréstimos com cliente, livro e situação
SELECT
    e.id,
    c.nome AS cliente,
    l.titulo AS livro,
    e.data_emprestimo,
    e.data_prevista_devolucao,
    e.data_devolucao,
    CASE
        WHEN e.data_devolucao IS NULL THEN 'Ativo'
        ELSE 'Devolvido'
    END AS situacao
FROM emprestimos e
INNER JOIN clientes c ON c.id = e.cliente_id
INNER JOIN livros l ON l.id = e.livro_id
ORDER BY e.id;


-- ============================================================
-- 4. RELATÓRIOS EXIGIDOS NO DESAFIO
-- ============================================================

-- 4.1 Livros disponíveis
-- Disponibilidade = quantidade de exemplares menos empréstimos ativos.
SELECT
    l.id,
    l.titulo,
    l.quantidade_exemplares,
    COUNT(e.id) FILTER (
        WHERE e.data_devolucao IS NULL
    ) AS emprestimos_ativos,
    l.quantidade_exemplares - COUNT(e.id) FILTER (
        WHERE e.data_devolucao IS NULL
    ) AS exemplares_disponiveis
FROM livros l
LEFT JOIN emprestimos e
    ON l.id = e.livro_id
GROUP BY
    l.id,
    l.titulo,
    l.quantidade_exemplares
HAVING
    l.quantidade_exemplares > COUNT(e.id) FILTER (
        WHERE e.data_devolucao IS NULL
    )
ORDER BY l.titulo;


-- 4.2 Livros emprestados (empréstimos ativos)
SELECT
    l.titulo,
    a.nome AS autor,
    c.nome AS cliente,
    e.data_emprestimo,
    e.data_prevista_devolucao
FROM emprestimos e
INNER JOIN livros l
    ON e.livro_id = l.id
INNER JOIN autores a
    ON l.autor_id = a.id
INNER JOIN clientes c
    ON e.cliente_id = c.id
WHERE e.data_devolucao IS NULL
ORDER BY e.data_emprestimo;


-- 4.3 Livros cadastrados por autor
-- LEFT JOIN também exibe autores sem livros cadastrados.
SELECT
    a.nome AS autor,
    l.titulo AS livro,
    l.ano_publicacao
FROM autores a
LEFT JOIN livros l
    ON a.id = l.autor_id
ORDER BY a.nome, l.titulo;


-- 4.4 Quantidade de empréstimos por livro
-- Inclui livros que ainda não tiveram empréstimos.
SELECT
    l.titulo,
    COUNT(e.id) AS quantidade_emprestimos
FROM livros l
LEFT JOIN emprestimos e
    ON l.id = e.livro_id
GROUP BY
    l.id,
    l.titulo
ORDER BY
    quantidade_emprestimos DESC,
    l.titulo ASC;


-- 4.5 Clientes com empréstimos ativos
SELECT
    c.id,
    c.nome AS cliente,
    c.email,
    COUNT(e.id) AS emprestimos_ativos
FROM clientes c
INNER JOIN emprestimos e
    ON c.id = e.cliente_id
WHERE e.data_devolucao IS NULL
GROUP BY
    c.id,
    c.nome,
    c.email
ORDER BY c.nome;


-- ============================================================
-- 5. CONSULTA COMPLEMENTAR - TOP 3 LIVROS MAIS EMPRESTADOS
-- Demonstra o uso de LIMIT.
-- ============================================================

SELECT
    l.titulo,
    COUNT(e.id) AS total_emprestimos
FROM livros l
LEFT JOIN emprestimos e
    ON l.id = e.livro_id
GROUP BY l.id, l.titulo
ORDER BY total_emprestimos DESC, l.titulo ASC
LIMIT 3;


