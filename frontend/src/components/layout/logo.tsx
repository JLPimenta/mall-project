import logoCompleto from '@/assets/logo-smartmall.webp'
import logoIcone from '@/assets/logo-icone.png'
import { cn } from '@/lib/utils'

const NOME = 'SmartMall Ops IA'

/**
 * Logo oficial. O desenho tem partes em navy, então sobre fundo escuro (menu lateral, painel do login)
 * vai num cartão branco para continuar legível.
 */
export function Logo({ className }: { className?: string }) {
  return <img src={logoCompleto} alt={NOME} width={900} height={272} className={cn('h-auto w-full max-w-60 object-contain', className)} />
}

/** Só o prédio com os nós: menu recolhido e espaços pequenos. */
export function LogoIcone({ className }: { className?: string }) {
  return <img src={logoIcone} alt={NOME} width={128} height={128} className={cn('size-8 rounded-md object-contain', className)} />
}
