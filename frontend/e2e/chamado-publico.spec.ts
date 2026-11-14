import { expect, test } from '@playwright/test'
import { contas } from './support/auth'
import { marcaUnica } from './support/programadas'
import { apiComo, PNG_1X1 } from './support/tarefas'

const marcas: string[] = []
test.describe.configure({ mode: 'serial' })

test.afterEach(async ({ page }) => {
  if (!marcas.length) return
  const admin = await apiComo(new URL(page.url()).origin, contas.administrador)
  try {
    for (const marca of marcas.splice(0)) {
      const resposta = await admin.delete(`/api/teste/e2e?marca=${encodeURIComponent(marca)}`)
      expect(resposta.ok(), await resposta.text()).toBe(true)
    }
  } finally {
    await admin.dispose()
  }
})

test('QR preenche o local editável e registra foto sem login', async ({ page }) => {
  const marca = marcaUnica()
  marcas.push(marca)
  expect((await page.request.get('/api/auth/sessao')).status()).toBe(401)
  await page.goto('/relatar?local=banheiro-norte')
  await expect(page.getByRole('heading', { name: 'Relatar ocorrência' })).toBeVisible()
  await expect(page.getByLabel('Local', { exact: true })).not.toHaveValue('')
  await expect(page.getByText('Local do QR:')).toBeVisible()
  await page.getByLabel('Local', { exact: true }).fill('Banheiro norte, próximo à entrada')
  await page.getByLabel('O que aconteceu?').fill(`${marca} Vazamento na pia`)
  await page.getByLabel('WhatsApp ou e-mail (opcional)').fill('cliente@example.com')
  await page.locator('#relato-galeria').setInputFiles({ name: 'pia.png', mimeType: 'image/png', buffer: PNG_1X1 })
  await expect(page.getByText('pia.png')).toBeVisible()
  const envio = page.waitForResponse((resposta) => resposta.url().endsWith('/api/publico/chamado') && resposta.request().method() === 'POST')
  await page.getByRole('button', { name: 'Enviar relato' }).click()
  const respostaPublica = await envio
  expect(respostaPublica.status()).toBe(201)
  const { id, status } = await respostaPublica.json() as { id: string; status: string }
  expect(status).toBe('EM_ANALISE')

  await expect(page.getByRole('heading', { name: 'Relato recebido' })).toBeVisible()
  await expect(page.getByText('Protocolo')).toBeVisible()
  await expect(page.locator('main strong')).toHaveText(/\S+/)

  const admin = await apiComo(new URL(page.url()).origin, contas.administrador)
  try {
    const detalhe = await admin.get(`/api/chamado/${id}`)
    expect(detalhe.ok(), await detalhe.text()).toBe(true)
    expect(await detalhe.json()).toMatchObject({
      status: 'EM_ANALISE',
      localQrCodigo: 'banheiro-norte',
      localInformado: 'Banheiro norte, próximo à entrada',
      contato: 'cliente@example.com',
      tarefaId: null,
      midia: { nome: 'pia.png', tipo: 'image/png' },
    })
  } finally {
    await admin.dispose()
  }
})

test('aceita local manual quando o QR é desconhecido', async ({ page }) => {
  const marca = marcaUnica()
  marcas.push(marca)
  await page.goto('/relatar?local=qr-desconhecido')
  await expect(page.getByText('QR não reconhecido. Informe o local.')).toBeVisible()
  await page.getByLabel('Local', { exact: true }).fill('Corredor Leste')
  await page.getByLabel('O que aconteceu?').fill(`${marca} Lixeira danificada`)
  await page.getByRole('button', { name: 'Enviar relato' }).click()
  await expect(page.getByRole('heading', { name: 'Relato recebido' })).toBeVisible()
})

test('rejeita mídia acima do limite e mantém o formulário preenchido', async ({ page }) => {
  await page.goto('/relatar')
  await page.getByLabel('Local', { exact: true }).fill('Entrada principal')
  await page.getByLabel('O que aconteceu?').fill('Porta emperrada')
  await page.locator('#relato-galeria').setInputFiles({ name: 'grande.png', mimeType: 'image/png', buffer: Buffer.alloc(5 * 1024 * 1024 + 1) })
  await expect(page.getByRole('alert')).toContainText('A foto deve ter no máximo 5 MB.')
  await expect(page.getByRole('button', { name: 'Enviar relato' })).toBeDisabled()
  await expect(page.getByLabel('O que aconteceu?')).toHaveValue('Porta emperrada')
})

test('formulário cabe na tela do celular', async ({ page }) => {
  await page.goto('/relatar?local=banheiro-norte')
  await expect(page.getByRole('heading', { name: 'Relatar ocorrência' })).toBeVisible()
  const largura = await page.evaluate(() => ({ pagina: document.documentElement.scrollWidth, tela: window.innerWidth }))
  expect(largura.pagina).toBeLessThanOrEqual(largura.tela)
})
