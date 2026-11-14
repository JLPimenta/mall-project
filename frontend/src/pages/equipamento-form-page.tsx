import { useParams, useSearchParams } from 'react-router'
import { PageHeader } from '@/components/shared/page-header'
import { RegistroLoader } from '@/components/shared/registro-loader'
import { EquipamentoForm } from '@/features/equipamentos/components/equipamento-form'
import { useEquipamento, useSalvarEquipamento } from '@/features/equipamentos/hooks'
import { paraFormulario, paraRequisicao } from '@/features/equipamentos/schemas'
import { useAcoesCadastro } from '@/lib/cadastro'

export function EquipamentoFormPage() {
  const { id } = useParams()
  // Vindo da planta do piso ("Novo equipamento neste piso"), o piso já vem preenchido.
  const [busca] = useSearchParams()
  const pisoInicial = id ? undefined : busca.get('piso') ?? undefined
  const equipamento = useEquipamento(id)
  const acoes = useAcoesCadastro({
    id,
    lista: '/cadastros/equipamentos',
    mutacao: useSalvarEquipamento(id),
    paraRequisicao,
    paraFormulario,
    mensagemSucesso: 'Equipamento salvo.',
  })

  return (
    <>
      <PageHeader voltar="/cadastros/equipamentos" title={id ? 'Editar equipamento' : 'Novo equipamento'} />
      <RegistroLoader edicao={!!id} consulta={equipamento} naoEncontrado="Equipamento não encontrado.">
        <EquipamentoForm key={equipamento.data?.id ?? 'novo'} defaultValues={{ ...paraFormulario(equipamento.data), ...(pisoInicial ? { pisoId: pisoInicial } : {}) }} {...acoes} />
      </RegistroLoader>
    </>
  )
}
