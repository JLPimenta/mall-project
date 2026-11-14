import { MessageSquareWarningIcon } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useSessao } from '@/features/auth/hooks'
import { temPerfil } from '@/features/auth/permissoes'
import { useAbrirChamado } from '../hooks'
import { AbrirChamadoDialog } from './abrir-chamado-dialog'

/** "Abrir chamado" em Tarefas: qualquer perfil relata um problema; a gestão decide em Chamados. */
export function BotaoAbrirChamado() {
  const [aberto, setAberto] = useState(false)
  const abrir = useAbrirChamado()
  const navigate = useNavigate()
  const { data: usuario } = useSessao()
  const gestao = temPerfil(usuario?.perfil, ['ADMINISTRADOR', 'SUPERVISOR'])

  return (
    <>
      <Button variant="outline" onClick={() => setAberto(true)}>
        <MessageSquareWarningIcon aria-hidden />
        Abrir chamado
      </Button>
      <AbrirChamadoDialog
        comMidia
        open={aberto}
        onOpenChange={setAberto}
        onAbrir={async (dados) => {
          const chamado = await abrir.mutateAsync({ dados: { localInformado: dados.localInformado, descricao: dados.descricao }, midia: dados.midia })
          // O Toaster fica fora do Router: a ação usa navigate (deste componente), nunca <Link>.
          toast.success(`Chamado ${chamado.protocolo} aberto.`, {
            action: gestao ? { label: 'Abrir', onClick: () => navigate(`/chamados/${chamado.id}`) } : undefined,
          })
        }}
      />
    </>
  )
}
