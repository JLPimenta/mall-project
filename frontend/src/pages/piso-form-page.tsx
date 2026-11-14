import { useParams } from 'react-router'
import { PageHeader } from '@/components/shared/page-header'
import { RegistroLoader } from '@/components/shared/registro-loader'
import { MarcadoresEditor } from '@/features/pisos/components/marcadores-editor'
import { PisoForm } from '@/features/pisos/components/piso-form'
import { PlantaPiso } from '@/features/pisos/components/planta-piso'
import { usePiso, usePlanta, useSalvarPiso } from '@/features/pisos/hooks'
import { paraFormulario, paraRequisicao } from '@/features/pisos/schemas'
import { useAcoesCadastro } from '@/lib/cadastro'

/** Cadastro do piso; na edição, também a planta (PDF) e as posições dos marcadores da Central. */
export function PisoFormPage() {
  const { id } = useParams()
  const piso = usePiso(id)
  const acoes = useAcoesCadastro({
    id,
    lista: '/cadastros/pisos',
    mutacao: useSalvarPiso(id),
    paraRequisicao,
    paraFormulario,
    mensagemSucesso: 'Piso salvo.',
  })

  return (
    <>
      <PageHeader voltar="/cadastros/pisos" title={id ? 'Editar piso' : 'Novo piso'} />
      <RegistroLoader edicao={!!id} consulta={piso} naoEncontrado="Piso não encontrado.">
        <div className="grid max-w-6xl gap-8">
          <PisoForm key={piso.data?.id ?? 'novo'} defaultValues={paraFormulario(piso.data)} {...acoes} />
          {piso.data && <PlantaEMarcadores pisoId={piso.data.id} pisoNome={piso.data.nome} />}
        </div>
      </RegistroLoader>
    </>
  )
}

function PlantaEMarcadores({ pisoId, pisoNome }: { pisoId: string; pisoNome: string }) {
  const planta = usePlanta(pisoId)
  return (
    <>
      <PlantaPiso pisoId={pisoId} pisoNome={pisoNome} />
      {planta.data && <MarcadoresEditor pisoId={pisoId} pisoNome={pisoNome} planta={planta.data} />}
    </>
  )
}
