import { expect, test, type APIRequestContext, type Page } from '@playwright/test'
import { contas, entrar } from './support/auth'
import { dialogoDescarte, salvarCadastro, sufixoUnico } from './support/cadastros'
import { marcaUnica } from './support/programadas'
import { apiComo } from './support/tarefas'

/**
 * Cadastro de piso, planta em PDF (convertida no navegador) e marcadores; visão do piso na Central de Controle.
 * Cada teste cria o próprio piso (e o equipamento a posicionar) e apaga tudo no fim.
 */

const LISTA = '/cadastros/pisos'

/** PDF mínimo de uma página (600×400 pt, retângulo azul). O pdf.js reconstrói a tabela xref ausente. */
const PDF = Buffer.from(
  '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n' +
    '3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 600 400]/Contents 4 0 R>>endobj\n' +
    '4 0 obj<</Length 30>>stream\n0 0 1 rg 50 50 200 100 re f\nendstream endobj\ntrailer<</Root 1 0 R>>\n%%EOF\n',
)

type Criado = { pisoId: string; nome: string; equipamentoId: string; equipamentoCodigo: string; marca: string }

let admin: APIRequestContext
let criado: Criado

test.beforeEach(async ({ baseURL }) => {
  admin = await apiComo(baseURL!, contas.administrador)
  const sufixo = sufixoUnico(6)
  const piso = await admin.post('/api/piso', { data: { codigo: `E${sufixo}`, nome: `Piso E2E ${sufixo}`, ordem: 900 } })
  expect(piso.ok(), await piso.text()).toBe(true)
  const pisoId = ((await piso.json()) as { id: string }).id
  const equipamentoCodigo = `E2E-${sufixo}`
  const equipamento = await admin.post('/api/equipamento', {
    data: { codigo: equipamentoCodigo, nome: 'Bomba de teste', categoria: 'HIDRAULICA', pisoId, localizacao: 'Casa de bombas', condicao: 'ATENCAO' },
  })
  expect(equipamento.ok(), await equipamento.text()).toBe(true)
  criado = { pisoId, nome: `Piso E2E ${sufixo}`, equipamentoId: ((await equipamento.json()) as { id: string }).id, equipamentoCodigo, marca: marcaUnica() }
})

test.afterEach(async () => {
  // Locais de QR Code criados na planta levam a marca no nome (limpeza só no perfil dev).
  await admin.delete(`/api/teste/e2e?marca=${criado.marca}`)
  await admin.delete(`/api/equipamento/${criado.equipamentoId}`)
  await admin.delete(`/api/piso/${criado.pisoId}`)
  await admin.dispose()
})

async function enviarPlanta(page: Page) {
  await page.getByLabel('Arquivo PDF da planta').setInputFiles({ name: 'planta-teste.pdf', mimeType: 'application/pdf', buffer: PDF })
  await expect(page.getByRole('img', { name: 'Prévia da página 1 da planta' })).toBeVisible({ timeout: 15_000 })
  // Uma página só: sem escolha de página.
  await expect(page.getByLabel('Página')).toHaveCount(0)
  const envio = page.waitForResponse((r) => r.url().endsWith(`/api/piso/${criado.pisoId}/planta`) && r.request().method() === 'PUT')
  await page.getByRole('button', { name: 'Salvar planta' }).click()
  expect((await envio).ok()).toBe(true)
  // A prévia fica recolhida em "Ver planta"; o resumo mostra o arquivo salvo.
  await expect(page.getByText('Ver planta')).toBeVisible()
  await expect(page.getByRole('img', { name: `Planta do ${criado.nome}` })).toBeHidden()
}

test.describe('Cadastro de piso', () => {
  test.beforeEach(async ({ page }) => entrar(page, contas.supervisor))

  test('novo piso vira edição ao salvar e mostra a seção da planta', async ({ page }) => {
    const sufixo = sufixoUnico(6)
    await page.goto(`${LISTA}/novo`)
    await expect(page.getByRole('heading', { level: 2, name: 'Planta' })).toHaveCount(0)
    await page.getByLabel('Código', { exact: true }).fill(`N${sufixo}`)
    await page.getByLabel('Nome', { exact: true }).fill(`Piso novo ${sufixo}`)
    await page.getByLabel('Ordem').fill('901')

    const id = await salvarCadastro(page, { rotulo: 'Piso', recurso: 'piso', lista: LISTA, mensagem: 'Piso salvo.' })
    try {
      await expect(page.getByRole('heading', { level: 2, name: 'Planta' })).toBeVisible()
      await expect(page.getByRole('button', { name: 'Enviar planta (PDF)' })).toBeVisible()
    } finally {
      await admin.delete(`/api/piso/${id}`)
    }
  })

  test('cancelar com alterações pede para descartar', async ({ page }) => {
    await page.goto(`${LISTA}/${criado.pisoId}`)
    await page.getByLabel('Nome', { exact: true }).fill('Outro nome')
    await page.getByRole('button', { name: 'Cancelar' }).click()
    await dialogoDescarte(page).getByRole('button', { name: 'Descartar' }).click()
    await expect(page).toHaveURL(new RegExp(`${LISTA}$`))
  })

  test('piso com equipamento não pode ser excluído', async ({ page }) => {
    await page.goto(LISTA)
    await page.getByRole('button', { name: `Excluir ${criado.nome}` }).click()
    await page.getByRole('alertdialog').getByRole('button', { name: 'Excluir' }).click()
    await expect(page.getByText('Piso com equipamentos não pode ser excluído.')).toBeVisible()
  })

  test('envia a planta em PDF, baixa o original e posiciona o equipamento', async ({ page }) => {
    await page.goto(`${LISTA}/${criado.pisoId}`)
    await enviarPlanta(page)
    await expect(page.getByRole('link', { name: 'Baixar PDF' })).toHaveAttribute('href', `/api/piso/${criado.pisoId}/planta/pdf`)
    const pdf = await page.request.get(`/api/piso/${criado.pisoId}/planta/pdf`)
    expect(pdf.headers()['content-type']).toBe('application/pdf')

    // Escolhe o equipamento e clica na planta.
    const editor = page.getByRole('region', { name: 'Posições na planta' })
    await editor.getByRole('button', { name: new RegExp(criado.equipamentoCodigo) }).click()
    await editor.getByRole('group', { name: /para posicionar marcadores$/ }).click({ position: { x: 60, y: 40 } })
    const marcador = editor.getByRole('button', { name: `${criado.equipamentoCodigo} · Bomba de teste`, exact: true })
    await expect(marcador).toBeVisible()
    // Teclado: setas ajustam a posição.
    await marcador.focus()
    await page.keyboard.press('ArrowRight')

    const salvar = page.waitForResponse((r) => r.url().endsWith(`/api/piso/${criado.pisoId}/marcadores`) && r.request().method() === 'PUT')
    await editor.getByRole('button', { name: 'Salvar posições' }).click()
    expect((await salvar).ok()).toBe(true)
    const { equipamentos } = (await (await admin.get(`/api/piso/${criado.pisoId}/marcadores`)).json()) as { equipamentos: { id: string; x: number | null }[] }
    expect(equipamentos.find((e) => e.id === criado.equipamentoId)?.x).toBeGreaterThan(0)
  })
})

test.describe('Adicionar ponto na planta', () => {
  test.beforeEach(async ({ page }) => {
    await entrar(page, contas.supervisor)
    await page.goto(`${LISTA}/${criado.pisoId}`)
    await enviarPlanta(page)
  })

  const editor = (page: Page) => page.getByRole('region', { name: 'Posições na planta' })
  const planta = (page: Page) => editor(page).getByRole('group', { name: /para posicionar marcadores$/ })
  const dialogo = (page: Page) => page.getByRole('alertdialog', { name: 'Adicionar ponto aqui' })

  test('clicar num lugar vazio cria um local de QR Code ali', async ({ page }) => {
    await expect(editor(page)).toContainText('Para adicionar um ponto, clique no lugar da planta.')
    await planta(page).click({ position: { x: 80, y: 50 } })
    await expect(dialogo(page)).toBeVisible()
    // O equipamento do piso ainda sem posição aparece como opção.
    await expect(dialogo(page).getByRole('button', { name: new RegExp(criado.equipamentoCodigo) })).toBeVisible()

    const nome = `Quiosque ${criado.marca}`
    await dialogo(page).getByRole('textbox', { name: 'Novo local de QR Code' }).fill(nome)
    const criacao = page.waitForResponse((r) => r.url().endsWith(`/api/piso/${criado.pisoId}/locais`))
    await dialogo(page).getByRole('button', { name: 'Criar aqui' }).click()
    expect((await criacao).ok()).toBe(true)
    await expect(dialogo(page)).toHaveCount(0)

    const marcador = planta(page).getByRole('button', { name: new RegExp(`^quiosque-e2e-.* · ${nome}$`) })
    await expect(marcador).toBeVisible()
    const salvar = page.waitForResponse((r) => r.url().endsWith(`/api/piso/${criado.pisoId}/marcadores`) && r.request().method() === 'PUT')
    await editor(page).getByRole('button', { name: 'Salvar posições' }).click()
    expect((await salvar).ok()).toBe(true)
    const { locais } = (await (await admin.get(`/api/piso/${criado.pisoId}/marcadores`)).json()) as { locais: { nome: string; x: number | null }[] }
    expect(locais.find((l) => l.nome === nome)?.x).toBeGreaterThan(0)
  })

  test('posiciona um item sem posição e leva ao novo equipamento com o piso preenchido', async ({ page }) => {
    await planta(page).click({ position: { x: 80, y: 50 } })
    await dialogo(page).getByRole('button', { name: new RegExp(criado.equipamentoCodigo) }).click()
    await expect(planta(page).getByRole('button', { name: `${criado.equipamentoCodigo} · Bomba de teste`, exact: true })).toBeVisible()

    // Com posição não salva, o cadastro de equipamento pede para salvar antes.
    await planta(page).click({ position: { x: 140, y: 90 } })
    await expect(dialogo(page)).toContainText('Para cadastrar um equipamento, salve as posições primeiro.')
    await dialogo(page).getByRole('button', { name: 'Cancelar' }).click()
    await editor(page).getByRole('button', { name: 'Descartar' }).click()

    await planta(page).click({ position: { x: 140, y: 90 } })
    await dialogo(page).getByRole('link', { name: 'Novo equipamento neste piso' }).click()
    await expect(page).toHaveURL((u) => u.pathname === '/cadastros/equipamentos/novo' && u.searchParams.get('piso') === criado.pisoId)
    await expect(page.getByLabel('Piso', { exact: true })).toHaveText(criado.nome)
  })
})

test.describe('Central de Controle: visão do piso', () => {
  test('saúda o usuário pelo nome', async ({ page }) => {
    await entrar(page, contas.supervisor)
    await page.goto('/central')
    await expect(page.getByText(/^(Bom dia|Boa tarde|Boa noite|Olá|De volta), Ana[.?]$/)).toBeVisible()
  })

  test('piso sem planta oferece enviar a planta', async ({ page }) => {
    await entrar(page, contas.supervisor)
    await page.goto(`/central?piso=${criado.pisoId}`)
    await expect(page.getByText('Piso sem planta')).toBeVisible()
    await expect(page.getByRole('link', { name: 'Enviar planta' })).toHaveAttribute('href', `${LISTA}/${criado.pisoId}`)
  })

  test('mostra o equipamento posicionado e o detalhe pelo teclado', async ({ page }) => {
    await entrar(page, contas.supervisor)
    await page.goto(`${LISTA}/${criado.pisoId}`)
    await enviarPlanta(page)
    const salvo = await admin.put(`/api/piso/${criado.pisoId}/marcadores`, {
      data: { marcadores: [{ tipo: 'EQUIPAMENTO', referenciaId: criado.equipamentoId, x: 0.5, y: 0.5 }] },
    })
    expect(salvo.ok(), await salvo.text()).toBe(true)

    await page.goto(`/central?piso=${criado.pisoId}`)
    const planta = page.getByRole('group', { name: `Planta do ${criado.nome}` })
    const marcador = planta.getByRole('button', { name: new RegExp(`^${criado.equipamentoCodigo} · Bomba de teste, atenção`) })
    await expect(marcador).toBeVisible()
    await marcador.focus()
    await page.keyboard.press('Enter')
    const detalhe = page.getByRole('article', { name: `${criado.equipamentoCodigo} · Bomba de teste` })
    await expect(detalhe).toContainText('Atenção')
    await expect(detalhe).toContainText('Tarefas de hoje')

    // Sem a camada de equipamentos (e sem tarefa hoje), o marcador some.
    await page.getByRole('group', { name: 'Camadas da planta' }).getByRole('button', { name: 'Equipamentos' }).click()
    await expect(marcador).toHaveCount(0)
  })

  test('Funcionário não vê o mapa nem altera pisos pela API', async ({ baseURL }) => {
    const joao = await apiComo(baseURL!, contas.funcionario)
    try {
      expect((await joao.get(`/api/piso/${criado.pisoId}/mapa`)).status()).toBe(403)
      expect((await joao.put(`/api/piso/${criado.pisoId}/marcadores`, { data: { marcadores: [] } })).status()).toBe(403)
      expect((await joao.get('/api/piso')).status()).toBe(200)
    } finally {
      await joao.dispose()
    }
  })
})
