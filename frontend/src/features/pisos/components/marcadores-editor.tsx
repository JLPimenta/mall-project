import { Loader2Icon, MapPinXIcon } from 'lucide-react'
import { useState, type KeyboardEvent } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { mensagemDeErro } from '@/lib/cadastro'
import { preenchimentoDoTom } from '@/lib/tons'
import { useMarcadores, useSalvarMarcadores } from '../hooks'
import type { Marcadores, MarcadorRequest, Planta, Posicao, TipoMarcador } from '../types'
import { chave } from '../marcadores'
import { AdicionarPontoDialog } from './adicionar-ponto-dialog'
import { MarcadoresLista } from './marcadores-lista'
import { MarcadorSvg, PlantaSvg } from './planta-svg'

function posicoesIniciais(m: Marcadores) {
  const mapa = new Map<string, Posicao>()
  for (const [tipo, itens] of [['EQUIPAMENTO', m.equipamentos], ['LOCAL_QR', m.locais]] as const) {
    for (const i of itens) if (i.x != null && i.y != null) mapa.set(chave(tipo, i.id), { x: i.x, y: i.y })
  }
  return mapa
}

const iguais = (a: Map<string, Posicao>, b: Map<string, Posicao>) =>
  a.size === b.size && [...a].every(([k, p]) => b.get(k)?.x === p.x && b.get(k)?.y === p.y)

/** Passo das setas: 0,5% da planta (Shift: 2%). */
const passo = (e: KeyboardEvent) => (e.shiftKey ? 0.02 : 0.005)
const limitar = (v: number) => Math.round(Math.min(1, Math.max(0, v)) * 10000) / 10000

type EditorProps = { pisoId: string; pisoNome: string; planta: Planta }

/** Posições de equipamentos e locais com QR Code sobre a planta. Base dos marcadores da Central de Controle. */
export function MarcadoresEditor(props: EditorProps) {
  const consulta = useMarcadores(props.pisoId)
  if (consulta.isPending) return <Skeleton className="h-64 w-full" />
  if (!consulta.data) return null
  // Recria o editor só quando as posições gravadas mudam (ao salvar). Um local de QR Code novo entra
  // na lista sem recriar o editor, para não perder posições ainda não salvas.
  return <Editor key={JSON.stringify([...posicoesIniciais(consulta.data)])} {...props} marcadores={consulta.data} />
}

function Editor({ pisoId, pisoNome, planta, marcadores }: EditorProps & { marcadores: Marcadores }) {
  const salvar = useSalvarMarcadores(pisoId)
  const [salvas] = useState(() => posicoesIniciais(marcadores))
  const [posicoes, setPosicoes] = useState(salvas)
  const [selecionado, setSelecionado] = useState<string | null>(null)
  /** Ponto vazio clicado sem item escolhido: abre "Adicionar ponto aqui". */
  const [pontoNovo, setPontoNovo] = useState<Posicao | null>(null)
  const alterado = !iguais(posicoes, salvas)
  const itens = [
    ...marcadores.equipamentos.map((i) => ({ ...i, tipo: 'EQUIPAMENTO' as TipoMarcador })),
    ...marcadores.locais.map((i) => ({ ...i, tipo: 'LOCAL_QR' as TipoMarcador })),
  ]
  const nomeDe = (k: string) => {
    const item = itens.find((i) => chave(i.tipo, i.id) === k)
    return item ? `${item.codigo} · ${item.nome}` : k
  }

  const posicionar = (k: string, p: Posicao) => setPosicoes((atual) => new Map(atual).set(k, { x: limitar(p.x), y: limitar(p.y) }))
  const tirar = (k: string) =>
    setPosicoes((atual) => {
      const novo = new Map(atual)
      novo.delete(k)
      return novo
    })

  // Com um item escolhido na lista, o clique o posiciona (ou move). Sem item, o clique pergunta o que fica ali.
  const clicarNaPlanta = (p: Posicao) => {
    if (!selecionado) return setPontoNovo(p)
    posicionar(selecionado, p)
    setSelecionado(null)
  }

  const escolherNoPonto = (k: string) => {
    if (pontoNovo) posicionar(k, pontoNovo)
    setPontoNovo(null)
  }
  const semPosicao = itens.filter((i) => !posicoes.has(chave(i.tipo, i.id)))
  const alternarSelecao = (k: string) => setSelecionado((atual) => (atual === k ? null : k))

  const teclado = (k: string) => (e: KeyboardEvent) => {
    const p = posicoes.get(k)
    if (!p) return
    const deslocamentos: Record<string, Posicao> = { ArrowLeft: { x: -1, y: 0 }, ArrowRight: { x: 1, y: 0 }, ArrowUp: { x: 0, y: -1 }, ArrowDown: { x: 0, y: 1 } }
    if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault()
      return tirar(k)
    }
    const d = deslocamentos[e.key]
    if (!d) return
    e.preventDefault()
    posicionar(k, { x: p.x + d.x * passo(e), y: p.y + d.y * passo(e) })
  }

  const gravar = () => {
    const lista: MarcadorRequest[] = [...posicoes].map(([k, p]) => {
      const [tipo, referenciaId] = k.split(':') as [TipoMarcador, string]
      return { tipo, referenciaId, x: p.x, y: p.y }
    })
    salvar.mutate(lista, {
      onSuccess: () => toast.success('Posições salvas.'),
      onError: (e) => toast.error(mensagemDeErro(e, 'Não foi possível salvar as posições.')),
    })
  }

  return (
    <section aria-labelledby="marcadores-titulo" className="grid gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="marcadores-titulo" className="text-lg font-semibold">
          Posições na planta
        </h2>
        <div className="flex gap-2">
          {selecionado && posicoes.has(selecionado) && (
            <Button variant="ghost" size="sm" onClick={() => tirar(selecionado)}>
              <MapPinXIcon aria-hidden /> Tirar da planta
            </Button>
          )}
          <Button variant="outline" size="sm" disabled={!alterado || salvar.isPending} onClick={() => setPosicoes(salvas)}>
            Descartar
          </Button>
          <Button size="sm" disabled={!alterado || salvar.isPending} onClick={gravar}>
            {salvar.isPending && <Loader2Icon className="animate-spin" aria-hidden />}
            Salvar posições
          </Button>
        </div>
      </div>
      <p className="text-sm text-muted-foreground" aria-live="polite">
        {selecionado
          ? `Clique na planta para posicionar ${nomeDe(selecionado)}. Setas ajustam; Delete tira; clique de novo no item para cancelar.`
          : 'Para adicionar um ponto, clique no lugar da planta. Para mover, escolha o item na lista ou clique no marcador.'}
      </p>
      <div className="grid items-start gap-4 lg:grid-cols-[16rem_minmax(0,1fr)]">
        <div className="grid gap-4 lg:max-h-[70vh] lg:overflow-y-auto lg:pr-1">
          <MarcadoresLista titulo="Equipamentos" tipo="EQUIPAMENTO" itens={marcadores.equipamentos} posicoes={posicoes} selecionado={selecionado} onSelecionar={alternarSelecao} />
          <MarcadoresLista titulo="Locais com QR Code" tipo="LOCAL_QR" itens={marcadores.locais} posicoes={posicoes} selecionado={selecionado} onSelecionar={alternarSelecao} />
        </div>
        <PlantaSvg pisoId={pisoId} planta={planta} rotulo={`Planta do ${pisoNome} para posicionar marcadores`} onClicar={clicarNaPlanta}>
          {[...posicoes].map(([k, p]) => (
            <MarcadorSvg
              key={k}
              planta={planta}
              posicao={p}
              rotulo={nomeDe(k)}
              texto={nomeDe(k).split(' · ')[0]}
              forma={k.startsWith('LOCAL_QR') ? 'losango' : 'circulo'}
              preenchimento={k.startsWith('LOCAL_QR') ? preenchimentoDoTom.andamento : preenchimentoDoTom.info}
              selecionado={selecionado === k}
              onSelecionar={() => setSelecionado(k)}
              onTeclado={teclado(k)}
            />
          ))}
        </PlantaSvg>
      </div>
      <AdicionarPontoDialog
        pisoId={pisoId}
        aberto={!!pontoNovo}
        onFechar={() => setPontoNovo(null)}
        semPosicao={semPosicao}
        onEscolher={escolherNoPonto}
        alterado={alterado}
      />
    </section>
  )
}
