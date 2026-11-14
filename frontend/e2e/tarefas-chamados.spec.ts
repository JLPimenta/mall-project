import { expect, test, type APIRequestContext, type Page } from '@playwright/test'
import { contas, entrar } from './support/auth'
import { escolher } from './support/cadastros'
import { excluirPorNome, item as itemModelo, LISTA_MODELOS, nomeUnico, salvar } from './support/checklists'
import { camposSemLimite } from './support/limites'
import { apiComo, criarTarefaDoJoao, descartarProgramada, imagem, type TarefaCriada } from './support/tarefas'

/**
 * Tarefas e chamados: "Minhas tarefas", "Abrir chamado" em Tarefas e não conformidade no checklist da execução.
 * Cada teste cria a própria manutenção programada (marca E2E-…); o descarte apaga também os chamados com a marca.
 */

let admin: APIRequestContext
let joao: APIRequestContext
let t: TarefaCriada

test.beforeEach(async ({ baseURL }) => {
  admin = await apiComo(baseURL!, contas.administrador)
  joao = await apiComo(baseURL!, contas.funcionario)
  t = await criarTarefaDoJoao(admin)
})

test.afterEach(async () => {
  await descartarProgramada(admin, t)
  await admin.dispose()
  await joao.dispose()
})

const linkDaTarefa = (page: Page, id: string) => page.locator(`a[href="/tarefas/${id}"]`)
const formulario = (page: Page) => page.getByRole('form', { name: 'Execução da tarefa' })

test.describe('Minhas tarefas', () => {
  test('mostra só as tarefas de que o usuário é responsável, no Kanban e no calendário', async ({ page }) => {
    const outra = await criarTarefaDoJoao(admin, t.dia)
    try {
      expect((await joao.post(`/api/tarefa/${t.tarefaId}/assumir`)).ok()).toBe(true)
      await entrar(page, contas.funcionario)
      await page.goto(`/tarefas?dia=${t.dia}`)

      // Kanban é a visão padrão.
      await expect(page.getByRole('group', { name: 'Visualização' }).getByRole('button', { name: 'Kanban' })).toHaveAttribute('aria-pressed', 'true')
      await expect(linkDaTarefa(page, t.tarefaId)).toBeVisible()
      await expect(linkDaTarefa(page, outra.tarefaId)).toBeVisible()

      const minhas = page.getByRole('search').getByRole('button', { name: 'Minhas tarefas' })
      await minhas.click()
      await expect(minhas).toHaveAttribute('aria-pressed', 'true')
      await expect(page).toHaveURL(/minhas=1/)
      await expect(linkDaTarefa(page, t.tarefaId)).toBeVisible()
      await expect(linkDaTarefa(page, outra.tarefaId)).toHaveCount(0)

      // O filtro continua no calendário (estado na URL).
      await page.getByRole('group', { name: 'Visualização' }).getByRole('button', { name: 'Calendário' }).click()
      await expect(page).toHaveURL(/minhas=1/)
      const painel = page.getByRole('list', { name: 'Tarefas do dia' })
      await expect(painel.locator(`a[href="/tarefas/${t.tarefaId}"]`)).toBeVisible()
      await expect(painel.locator(`a[href="/tarefas/${outra.tarefaId}"]`)).toHaveCount(0)

      await page.getByRole('search').getByRole('button', { name: 'Limpar filtros' }).click()
      await expect(page).not.toHaveURL(/minhas=1/)
      await expect(painel.locator(`a[href="/tarefas/${outra.tarefaId}"]`)).toBeVisible()
    } finally {
      await descartarProgramada(admin, outra)
    }
  })
})

test.describe('Abrir chamado em Tarefas', () => {
  test('fica ao lado de Programar manutenção para a gestão', async ({ page }) => {
    await entrar(page, contas.supervisor)
    await page.goto('/tarefas')

    const botoes = page.locator('main').getByRole('button', { name: 'Abrir chamado' }).or(page.getByRole('link', { name: 'Programar manutenção' }))
    await expect(botoes).toHaveText([/Abrir chamado/, /Programar manutenção/])
  })

  test('funcionário abre chamado, que entra na triagem com quem abriu', async ({ page }) => {
    await entrar(page, contas.funcionario)
    await page.goto('/tarefas')
    await expect(page.getByRole('link', { name: 'Programar manutenção' })).toHaveCount(0)

    await page.getByRole('button', { name: 'Abrir chamado' }).click()
    const dialogo = page.getByRole('alertdialog', { name: 'Abrir chamado' })
    expect(await camposSemLimite(page)).toEqual([])
    await expect(dialogo.getByLabel('Local')).toHaveAttribute('required', '')
    await expect(dialogo.getByLabel('O que aconteceu?')).toHaveAttribute('required', '')

    await dialogo.getByLabel('Local').fill('Piso L1 · Corredor das escadas')
    await dialogo.getByLabel('O que aconteceu?').fill(`Lâmpada queimada no corredor. ${t.marca}`)
    // Mesmos campos do relato público, sem o contato (quem abre já é identificado).
    await expect(dialogo.getByRole('button', { name: 'Abrir câmera' })).toBeVisible()
    await expect(dialogo.getByLabel('WhatsApp ou e-mail (opcional)')).toHaveCount(0)
    await dialogo.getByLabel('Foto ou vídeo (opcional)').setInputFiles(imagem('lampada.png'))
    await expect(dialogo.getByText('lampada.png')).toBeVisible()
    const abertura = page.waitForResponse((r) => new URL(r.url()).pathname === '/api/chamado' && r.request().method() === 'POST')
    await dialogo.getByRole('button', { name: 'Abrir chamado' }).click()
    const resposta = await abertura
    expect(resposta.ok()).toBe(true)
    const { id, protocolo } = (await resposta.json()) as { id: string; protocolo: string }
    await expect(dialogo).toHaveCount(0)
    await expect(page.getByText(`Chamado ${protocolo} aberto.`)).toBeVisible()

    const chamado = (await (await admin.get(`/api/chamado/${id}`)).json()) as {
      status: string
      abertoPor: string
      localInformado: string
      midia: { nome: string; tipo: string } | null
    }
    expect(chamado.midia).toMatchObject({ nome: 'lampada.png', tipo: 'image/png' })
    expect(chamado.status).toBe('EM_ANALISE')
    expect(chamado.abertoPor).toBe(contas.funcionario.nome)
    expect(chamado.localInformado).toBe('Piso L1 · Corredor das escadas')
  })
})

test.describe('Não conformidade no checklist', () => {
  test.beforeEach(async ({ page }) => {
    expect((await joao.post(`/api/tarefa/${t.tarefaId}/assumir`)).ok()).toBe(true)
    await entrar(page, contas.funcionario)
    await page.goto(`/tarefas/${t.tarefaId}`)
    await expect(formulario(page)).toBeVisible()
  })

  const grupo = (page: Page, pergunta: string) => formulario(page).getByRole('group', { name: pergunta, exact: false })

  test('resposta fora do esperado exige chamado antes de enviar para análise', async ({ page }) => {
    const tracao = 'Sistema de tração inspecionado?'
    await grupo(page, tracao).getByText('Não', { exact: true }).click()
    await expect(grupo(page, tracao).getByText('Não conforme')).toBeVisible()
    for (const pergunta of ['Cabos e freios em condição normal?', 'Portas e sensores funcionando?']) {
      await grupo(page, pergunta).getByText('Sim', { exact: true }).click()
      await expect(grupo(page, pergunta).getByText('Não conforme')).toHaveCount(0)
    }
    await formulario(page).getByRole('spinbutton', { name: 'Desnível na parada (mm)' }).fill('2')
    const anexo = page.waitForResponse((r) => r.url().endsWith(`/api/tarefa/${t.tarefaId}/evidencia`))
    await page.getByLabel('Arquivo de imagem').setInputFiles(imagem())
    expect((await anexo).ok()).toBe(true)

    // Sem chamado: não envia.
    let enviou = false
    page.on('request', (r) => {
      if (r.url().endsWith(`/api/tarefa/${t.tarefaId}/enviar`)) enviou = true
    })
    await page.getByRole('button', { name: 'Enviar para análise' }).click()
    await expect(formulario(page).getByText('Abra um chamado para os itens não conformes.')).toBeVisible()
    expect(enviou).toBe(false)

    await grupo(page, tracao).getByRole('button', { name: `Abrir chamado: ${tracao}` }).click()
    const dialogo = page.getByRole('alertdialog', { name: 'Abrir chamado' })
    await expect(dialogo).toContainText('Local:')
    const descricao = dialogo.getByLabel('O que aconteceu?')
    await expect(descricao).toHaveValue(new RegExp(`Não conformidade.*${tracao.replace('?', '\\?')}.*Resposta: Não \\(esperado: Sim\\)`))
    await descricao.fill(`${await descricao.inputValue()} ${t.marca}`)
    const abertura = page.waitForResponse((r) => new RegExp(`/api/tarefa/${t.tarefaId}/item/[^/]+/chamado$`).test(new URL(r.url()).pathname))
    await dialogo.getByRole('button', { name: 'Abrir chamado' }).click()
    expect((await abertura).ok()).toBe(true)
    await expect(grupo(page, tracao).getByText(/^Chamado CH-/)).toBeVisible()

    const envio = page.waitForResponse((r) => r.url().endsWith(`/api/tarefa/${t.tarefaId}/enviar`))
    await page.getByRole('button', { name: 'Enviar para análise' }).click()
    expect((await envio).ok()).toBe(true)
    await expect(formulario(page)).toHaveCount(0)

    // O chamado segue o fluxo normal (triagem) e aponta para a tarefa de origem.
    const detalhe = (await (await joao.get(`/api/tarefa/${t.tarefaId}`)).json()) as {
      tarefa: { status: string }
      itens: { pergunta: string; naoConforme: boolean; chamado: { id: string } | null }[]
    }
    expect(detalhe.tarefa.status).toBe('EM_ANALISE')
    const item = detalhe.itens.find((i) => i.pergunta === tracao)!
    expect(item.naoConforme).toBe(true)
    const chamado = (await (await admin.get(`/api/chamado/${item.chamado!.id}`)).json()) as { status: string; tarefaOrigemId: string }
    expect(chamado.status).toBe('EM_ANALISE')
    expect(chamado.tarefaOrigemId).toBe(t.tarefaId)
  })

  test('itens de texto e número têm a opção de abrir chamado; Sim/Não conforme não', async ({ page }) => {
    await expect(formulario(page).getByRole('button', { name: 'Abrir chamado: Desnível na parada (mm)' })).toBeVisible()
    await expect(formulario(page).getByRole('button', { name: 'Abrir chamado: Observações' })).toBeVisible()
    await grupo(page, 'Portas e sensores funcionando?').getByText('Sim', { exact: true }).click()
    await expect(grupo(page, 'Portas e sensores funcionando?').getByRole('button', { name: /^Abrir chamado/ })).toHaveCount(0)
  })
})

test.describe('Modelo de checklist: resposta esperada', () => {
  test('item Sim/Não começa esperando "Sim" e guarda a escolha', async ({ page }) => {
    const nome = nomeUnico()
    try {
      await entrar(page, contas.supervisor)
      await page.goto(`${LISTA_MODELOS}/novo`)
      await expect(itemModelo(page, 1).getByLabel('Resposta esperada')).toHaveText('Sim')

      await page.getByLabel('Nome', { exact: true }).fill(nome)
      await itemModelo(page, 1).getByLabel('Pergunta').fill('Ruído anormal?')
      await itemModelo(page, 1).getByLabel('Resposta esperada').click()
      await page.getByRole('option', { name: 'Não', exact: true }).click()
      await salvar(page)

      await page.reload()
      await expect(itemModelo(page, 1).getByLabel('Resposta esperada')).toHaveText('Não')
      // Texto e número não têm resposta esperada.
      await escolher(page, 'Tipo de resposta', 'Número')
      await expect(itemModelo(page, 1).getByLabel('Resposta esperada')).toHaveCount(0)
    } finally {
      await excluirPorNome(page, nome)
    }
  })
})
