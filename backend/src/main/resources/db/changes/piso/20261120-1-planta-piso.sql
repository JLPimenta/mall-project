--liquibase formatted sql

-- Planta do piso (PDF original + imagem gerada no navegador) e posição dos marcadores da Central de Controle.

--changeset smartmall:20261120-1-planta-piso
CREATE TABLE planta_piso
(
    id                VARCHAR(36)  NOT NULL,
    data_criacao      TIMESTAMP    NOT NULL,
    data_atualizacao  TIMESTAMP,
    piso_id           VARCHAR(36)  NOT NULL,
    -- PDF enviado (para baixar) e a página escolhida convertida em imagem (fundo da visão do piso).
    pdf_arquivo_id    VARCHAR(36)  NOT NULL,
    imagem_arquivo_id VARCHAR(36)  NOT NULL,
    nome_arquivo      VARCHAR(150) NOT NULL,
    tipo_imagem       VARCHAR(30)  NOT NULL,
    pagina            INTEGER      NOT NULL,
    largura           INTEGER      NOT NULL,
    altura            INTEGER      NOT NULL,
    CONSTRAINT pk_planta_piso PRIMARY KEY (id),
    CONSTRAINT uk_planta_piso_piso UNIQUE (piso_id),
    CONSTRAINT fk_planta_piso_piso FOREIGN KEY (piso_id) REFERENCES piso (id),
    CONSTRAINT fk_planta_piso_pdf FOREIGN KEY (pdf_arquivo_id) REFERENCES arquivo (id),
    CONSTRAINT fk_planta_piso_imagem FOREIGN KEY (imagem_arquivo_id) REFERENCES arquivo (id),
    CONSTRAINT ck_planta_piso_pagina CHECK (pagina BETWEEN 1 AND 500),
    CONSTRAINT ck_planta_piso_tamanho CHECK (largura BETWEEN 100 AND 10000 AND altura BETWEEN 100 AND 10000)
);

--changeset smartmall:20261120-2-marcador-piso
-- Posição relativa (0 a 1) de equipamentos e locais com QR Code sobre a planta. Um marcador por registro.
CREATE TABLE marcador_piso
(
    id               VARCHAR(36)   NOT NULL,
    data_criacao     TIMESTAMP     NOT NULL,
    data_atualizacao TIMESTAMP,
    piso_id          VARCHAR(36)   NOT NULL,
    tipo             VARCHAR(15)   NOT NULL,
    referencia_id    VARCHAR(36)   NOT NULL,
    x                NUMERIC(5, 4) NOT NULL,
    y                NUMERIC(5, 4) NOT NULL,
    CONSTRAINT pk_marcador_piso PRIMARY KEY (id),
    CONSTRAINT uk_marcador_piso_referencia UNIQUE (tipo, referencia_id),
    CONSTRAINT fk_marcador_piso_piso FOREIGN KEY (piso_id) REFERENCES piso (id) ON DELETE CASCADE,
    CONSTRAINT ck_marcador_piso_tipo CHECK (tipo IN ('EQUIPAMENTO', 'LOCAL_QR')),
    CONSTRAINT ck_marcador_piso_posicao CHECK (x BETWEEN 0 AND 1 AND y BETWEEN 0 AND 1)
);
CREATE INDEX ix_marcador_piso_piso ON marcador_piso (piso_id);
