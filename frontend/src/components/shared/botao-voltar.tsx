import { ChevronLeftIcon } from 'lucide-react'
import { useNavigate } from 'react-router'
import { Button } from '@/components/ui/button'
import { useVoltarPara } from '@/lib/navegacao'

/**
 * Botão "<" ao lado do título. Volta como o navegador (a tela anterior, com filtros e dia, que ficam na URL);
 * se a tela foi aberta direto pela URL, vai para a origem informada ou para `padrao`.
 * Formulário com alterações pede confirmação (bloqueio de navegação do CadastroForm).
 */
export function BotaoVoltar({ padrao }: { padrao: string }) {
  const navigate = useNavigate()
  const destino = useVoltarPara(padrao)

  const voltar = () => {
    // O React Router guarda a posição no histórico do app; 0 = primeira tela aberta nesta aba.
    const posicao = (window.history.state as { idx?: number } | null)?.idx ?? 0
    return posicao > 0 ? navigate(-1) : navigate(destino)
  }

  return (
    <Button type="button" variant="ghost" size="icon" aria-label="Voltar à tela anterior" className="-ml-2 shrink-0" onClick={voltar}>
      <ChevronLeftIcon aria-hidden />
    </Button>
  )
}
