# Central de Controle e planta do piso

Requisitos de origem: RF06 (Central de Controle, P0) e seção 9 da documentação inicial (diagrama do piso em SVG inline, marcadores operáveis pelo teclado).

## Tela

- **Saudação:** "Bom dia, Ana.", "Boa tarde, Ana.", "De volta, Ana?"… com uma frase curta. Muda com a hora do dia e é sorteada a cada visita (`features/central/saudacoes.ts`).
- **Visão geral:** indicadores de tarefas, equipes, equipamentos e alertas.
- **Visão do piso:** o piso escolhido fica na URL (`/central?piso=<id>`). A planta é desenhada em SVG inline, com a imagem gerada do PDF ao fundo.

| Camada | Marcador | Cor | Ao selecionar |
|---|---|---|---|
| Equipamentos | Círculo com o código | Condição (operando, atenção, inoperante); vermelho se houver tarefa atrasada | Condição, atrasadas, tarefas de hoje (links), "Ver em Tarefas" |
| Chamados abertos | Losango no ponto do QR Code | Prioridade (confirmada; sem ela, a sugerida) | Protocolo, situação, local, resumo, "Abrir chamado" |
| Tarefas do dia | Número sobre o equipamento | — | — (sem a camada Equipamentos, mostra só os que têm tarefa hoje) |

- Chamados abertos: registrada, em análise, aprovada, em execução. Só entram os com local QR posicionado.
- Equipamentos e chamados sem posição aparecem como contagem ("N sem posição na planta"), com link para o cadastro do piso.
- Marcadores são focáveis (Tab) e selecionados com Enter ou Espaço. A visão é atualizada a cada minuto.

## Cadastro de piso (Cadastros › Pisos)

| Campo | Regra |
|---|---|
| Código | Obrigatório, até 10, único |
| Nome | Obrigatório, até 100 |
| Ordem | 0 a 999 (ordem na lista de pisos) |

Piso com equipamentos ou locais de QR Code não pode ser excluído. Excluir o piso apaga a planta e os marcadores.

### Planta (PDF)

1. **Enviar planta (PDF):** o navegador lê o PDF (pdf.js). Nada vai ao servidor até salvar.
2. **Página:** com mais de uma página, escolher qual é a planta. A prévia mostra a página escolhida.
3. **Salvar planta:** envia o PDF original (até 15 MB) e a página em imagem WebP com o lado maior de 2400 px (até 5 MB; se passar, a qualidade é reduzida).
4. **Baixar PDF:** devolve o arquivo original. **Trocar** substitui PDF e imagem; os marcadores ficam.

- A página é desenhada com `intent: 'print'`. No modo de tela, o pdf.js avança a cada `requestAnimationFrame`, que para com a aba em segundo plano, e a conversão travava.
- O servidor confere o conteúdo: o PDF começa com `%PDF-`; a imagem é PNG, JPG ou WebP pela assinatura.
- Arquivos ficam no PostgreSQL (tabela `arquivo`), sem volume extra.

Planta inicial: Praça de Alimentação (`2026_11_CDS_MIX.pdf`, página 3, "2° pavimento"), carregada no Piso L2.

### Posições na planta

- **Adicionar um ponto:** clicar no lugar da planta. Abre "Adicionar ponto aqui", com três caminhos:
  - escolher um equipamento ou local do piso ainda sem posição;
  - **Novo local de QR Code:** informar o nome e "Criar aqui". O código do QR sai do nome, sem acentos (`quiosque-central`; repetido ganha "-2"), e o link do QR é `/relatar?local=<código>`;
  - **Novo equipamento neste piso:** abre o cadastro de equipamento com o piso preenchido. Com posições não salvas, pede para salvar antes.
- **Mover um ponto:** escolher o item na lista (ou clicar no marcador) e clicar no novo lugar. Clicar de novo no item cancela.
- Setas ajustam 0,5% (Shift: 2%); Delete tira o marcador. "Salvar posições" grava todas de uma vez; "Descartar" volta ao que estava salvo.
- A posição é relativa (x e y de 0 a 1, quatro casas): continua certa em qualquer tamanho de tela e depois de trocar a planta.
- Um marcador por registro. Equipamento que mudou de piso perde o marcador do piso anterior ao ser posicionado no novo.

## API

| Método | Rota | Perfil |
|---|---|---|
| GET | `/api/piso`, `/api/piso/{id}` | Todos |
| POST, PUT, DELETE | `/api/piso`, `/api/piso/{id}` | Gestão |
| GET, PUT (multipart: `dados`, `pdf`, `imagem`), DELETE | `/api/piso/{id}/planta` | Gestão |
| GET | `/api/piso/{id}/planta/imagem`, `/api/piso/{id}/planta/pdf` | Gestão |
| GET, PUT | `/api/piso/{id}/marcadores` | Gestão |
| POST | `/api/piso/{id}/locais` (cria local de QR Code) | Gestão |
| GET | `/api/piso/{id}/mapa` | Gestão |

## Pendências

- Trechos da planta (ex.: só a Praça de Alimentação dentro de um pavimento maior): hoje a planta é a página inteira.
- Posição de equipes em campo (exigiria o selo "Simulado").
