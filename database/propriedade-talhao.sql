-- Script de criação das tabelas de Propriedade e Talhão
-- Banco: PostgreSQL

CREATE TABLE IF NOT EXISTS propriedades (
    id_propriedade uuid PRIMARY KEY,
    id_produtor    uuid        NOT NULL,
    nome           varchar(150) NOT NULL,
    descricao      varchar(500),
    criado_em      timestamptz NOT NULL,
    atualizado_em  timestamptz
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_propriedades_produtor_nome
    ON propriedades (id_produtor, nome);

CREATE TABLE IF NOT EXISTS talhoes (
    id_talhao      uuid PRIMARY KEY,
    id_propriedade uuid        NOT NULL,
    nome           varchar(150) NOT NULL,
    cultura        varchar(100) NOT NULL,
    area_hectares  numeric(10,2) NOT NULL,
    criado_em      timestamptz   NOT NULL,
    atualizado_em  timestamptz
);

ALTER TABLE talhoes
    ADD CONSTRAINT fk_talhoes_propriedades
    FOREIGN KEY (id_propriedade)
    REFERENCES propriedades (id_propriedade)
    ON DELETE CASCADE;

CREATE UNIQUE INDEX IF NOT EXISTS ux_talhoes_propriedade_nome
    ON talhoes (id_propriedade, nome);

