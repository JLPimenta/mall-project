import { CircleDashedIcon, Loader2Icon, PlusIcon, WrenchIcon } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import { LimitedInput } from '@/components/shared/limited-input'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Field, FieldLabel } from '@/components/ui/field'
import { mensagemDeErro } from '@/lib/cadastro'
import { useOrigemAtual } from '@/lib/navegacao'
import { useCriarLocal } from '../hooks'
import { chave } from '../marcadores'
import type { PontoMarcavel, TipoMarcador } from '../types'

/** Mesmo limite de NovoLocalRequest e da coluna LOCAL_QR.NOME. */
const LIMITE_NOME_LOCAL = 100

type Item = PontoMarcavel & { tipo: TipoMarcador }

type AdicionarPontoDialogProps = {
  pisoId: string
  aberto: boolean
  onFechar: () => void
  /** Equipamentos e locais do piso ainda sem posição. */
  semPosicao: Item[]
  /** Posiciona o item escolhido (ou recém-criado) no ponto clicado. */
  onEscolher: (chave: string) => void
  /** Há posições não salvas: sair para cadastrar equipamento as perderia. */
  alterado: boolean
}

/**
 * Aberto ao clicar num ponto vazio da planta: posiciona ali um item sem posição, cria um local de QR Code
 * ou leva ao cadastro de equipamento já com este piso.
 */
export function AdicionarPontoDialog({ pisoId, aberto, onFechar, semPosicao, onEscolher, alterado }: AdicionarPontoDialogProps) {
  const [nome, setNome] = useState('')
  const [erro, setErro] = useState<string>()
  const criar = useCriarLocal(pisoId)
  const origem = useOrigemAtual()

  const criarLocal = async (e: FormEvent) => {
    e.preventDefault()
    setErro(undefined)
    try {
      const local = await criar.mutateAsync(nome.trim())
      setNome('')
      onEscolher(chave('LOCAL_QR', local.id))
    } catch (falha) {
      setErro(mensagemDeErro(falha, 'Não foi possível criar o local.'))
    }
  }

  return (
    <AlertDialog open={aberto} onOpenChange={(a) => !a && onFechar()}>
      <AlertDialogContent className="sm:max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle>Adicionar ponto aqui</AlertDialogTitle>
          <AlertDialogDescription>Escolha o que fica neste lugar da planta.</AlertDialogDescription>
        </AlertDialogHeader>

        {semPosicao.length > 0 && (
          <section aria-label="Sem posição" className="grid gap-1.5">
            <h3 className="text-sm font-medium">Sem posição</h3>
            <ul className="grid max-h-48 gap-1 overflow-y-auto">
              {semPosicao.map((i) => (
                <li key={chave(i.tipo, i.id)}>
                  <button
                    type="button"
                    onClick={() => onEscolher(chave(i.tipo, i.id))}
                    className="flex w-full items-center gap-2 rounded-md border px-2 py-1.5 text-left text-sm hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                  >
                    <CircleDashedIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                    <span className="min-w-0 flex-1 truncate">
                      <span className="font-mono text-xs">{i.codigo}</span> · {i.nome}
                    </span>
                    <span className="text-xs text-muted-foreground">{i.tipo === 'LOCAL_QR' ? 'QR Code' : 'Equipamento'}</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

        <form onSubmit={criarLocal} aria-label="Novo local de QR Code" className="grid gap-2">
          <Field className="gap-1.5">
            <FieldLabel htmlFor="novo-local-nome">Novo local de QR Code</FieldLabel>
            <div className="flex gap-2">
              <div className="min-w-0 flex-1">
                <LimitedInput
                  id="novo-local-nome"
                  required
                  placeholder="Ex.: Quiosque central"
                  maxLength={LIMITE_NOME_LOCAL}
                  length={nome.length}
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                />
              </div>
              <Button type="submit" disabled={criar.isPending || !nome.trim()}>
                {criar.isPending ? <Loader2Icon className="animate-spin" aria-hidden /> : <PlusIcon aria-hidden />}
                Criar aqui
              </Button>
            </div>
          </Field>
          {erro && (
            <p className="text-sm text-destructive" role="alert">
              {erro}
            </p>
          )}
        </form>

        <div className="grid gap-1 text-sm">
          {alterado ? (
            <p className="text-muted-foreground">Para cadastrar um equipamento, salve as posições primeiro.</p>
          ) : (
            <Button asChild variant="outline" className="justify-start">
              <Link to={`/cadastros/equipamentos/novo?piso=${pisoId}`} state={origem}>
                <WrenchIcon aria-hidden /> Novo equipamento neste piso
              </Link>
            </Button>
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel type="button">Cancelar</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
