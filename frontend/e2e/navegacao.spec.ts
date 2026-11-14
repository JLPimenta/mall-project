import { expect, test, type Page } from '@playwright/test'
import { contas, entrar } from './support/auth'
import { dialogoDescarte } from './support/cadastros'

/** Botão "<" (Voltar à tela anterior) em listas e formulários, e confirmação ao sair de formulário alterado. */

const voltar = (page: Page) => page.getByRole('button', { name: 'Voltar à tela anterior' })
const EQUIPAMENTOS = '/cadastros/equipamentos'

test.beforeEach(async ({ page }) => entrar(page, contas.supervisor))

test('listas e formulários têm o botão Voltar', async ({ page }) => {
  for (const tela of [
    '/tarefas',
    '/analise',
    '/chamados',
    '/estoque',
    '/planejamento/manutencoes-programadas',
    '/planejamento/manutencoes-programadas/nova',
    '/planejamento/modelos-checklist',
    '/planejamento/modelos-checklist/novo',
    EQUIPAMENTOS,
    `${EQUIPAMENTOS}/novo`,
    '/cadastros/equipes',
    '/cadastros/equipes/nova',
  ]) {
    await page.goto(tela)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(voltar(page), tela).toBeVisible()
  }
})

test('no formulário, Voltar retorna à listagem de origem', async ({ page }) => {
  await page.goto(EQUIPAMENTOS)
  await page.getByRole('link', { name: 'Novo equipamento' }).click()
  await expect(page).toHaveURL(new RegExp(`${EQUIPAMENTOS}/novo$`))

  await voltar(page).click()

  await expect(page).toHaveURL(new RegExp(`${EQUIPAMENTOS}$`))
})

test('com alterações, Voltar pede para descartar; Cancelar mantém os dados', async ({ page }) => {
  await page.goto(EQUIPAMENTOS)
  await page.getByRole('link', { name: 'Novo equipamento' }).click()
  await page.getByLabel('Nome', { exact: true }).fill('Bomba reserva')

  await voltar(page).click()
  await dialogoDescarte(page).getByRole('button', { name: 'Cancelar' }).click()
  await expect(page).toHaveURL(new RegExp(`${EQUIPAMENTOS}/novo$`))
  await expect(page.getByLabel('Nome', { exact: true })).toHaveValue('Bomba reserva')

  await voltar(page).click()
  await dialogoDescarte(page).getByRole('button', { name: 'Descartar' }).click()
  await expect(page).toHaveURL(new RegExp(`${EQUIPAMENTOS}$`))
})

test('com alterações, sair pelo menu também pede para descartar', async ({ page, isMobile }) => {
  await page.goto(`${EQUIPAMENTOS}/novo`)
  await page.getByLabel('Nome', { exact: true }).fill('Bomba reserva')

  if (isMobile) await page.getByRole('button', { name: 'Alternar menu' }).click()
  await page.getByRole('navigation', { name: 'Principal' }).getByRole('link', { name: 'Equipes' }).click()

  await expect(dialogoDescarte(page)).toBeVisible()
  await dialogoDescarte(page).getByRole('button', { name: 'Descartar' }).click()
  await expect(page).toHaveURL(/\/cadastros\/equipes$/)
})

test('na listagem, Voltar retorna à tela anterior', async ({ page }) => {
  await page.goto('/central')
  await page.getByRole('link', { name: 'Ver no Kanban' }).click()
  await expect(page).toHaveURL(/\/tarefas\?visao=kanban$/)

  await voltar(page).click()

  await expect(page).toHaveURL(/\/central$/)
})
