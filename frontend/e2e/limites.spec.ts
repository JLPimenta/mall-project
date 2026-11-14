import { expect, test } from '@playwright/test'
import { contas, entrar } from './support/auth'
import { escolherTipo, LISTA_CHECKLISTS } from './support/checklists'
import { camposSemLimite } from './support/limites'

/**
 * Guarda: nenhum campo de formulário sem limite de caracteres (ou min/max, para números).
 * Ao criar uma tela com formulário, inclua-a aqui.
 */
test.describe('Todo campo tem limite', () => {
  test('login', async ({ page }) => {
    await page.goto('/login')

    expect(await camposSemLimite(page)).toEqual([])
  })

  test('cadastro de checklist (com item Texto aberto)', async ({ page }) => {
    await entrar(page, contas.supervisor)
    await page.goto(`${LISTA_CHECKLISTS}/novo`)
    await escolherTipo(page, 1, 'Texto')

    expect(await camposSemLimite(page)).toEqual([])
  })

  test('edição de checklist da seed', async ({ page }) => {
    await entrar(page, contas.supervisor)
    await page.goto(`${LISTA_CHECKLISTS}/7c3a9e20-0001-4b1d-9c00-000000000001`)
    await expect(page.getByLabel('Nome', { exact: true })).not.toHaveValue('')

    expect(await camposSemLimite(page)).toEqual([])
  })
})
