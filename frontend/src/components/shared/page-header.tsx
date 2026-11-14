import type { ReactNode } from 'react'
import { BotaoVoltar } from './botao-voltar'

type PageHeaderProps = {
  title: string
  actions?: ReactNode
  /** Mostra o botão "<" (Voltar); o valor é o destino quando não há origem nem histórico. */
  voltar?: string
}

export function PageHeader({ title, actions, voltar }: PageHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-1">
        {voltar !== undefined && <BotaoVoltar padrao={voltar} />}
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}
