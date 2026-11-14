import { Loader2Icon } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'

type FormActionsProps = {
  salvando: boolean
  onCancel: () => void
  /** Registro que não pode ser editado: só "Voltar". */
  somenteLeitura?: boolean
  /** Ação principal além de Salvar (ex.: "Enviar para análise"); Salvar passa a ser secundário. */
  extra?: ReactNode
}

/**
 * Barra de ações padrão de cadastro/edição, fixa no rodapé.
 * A confirmação de descarte fica no CadastroForm (bloqueio de navegação), que cobre também Voltar e o menu.
 * As margens negativas compensam o padding do <main>.
 */
export function FormActions({ salvando, onCancel, somenteLeitura, extra }: FormActionsProps) {
  return (
    <div className="sticky bottom-0 z-20 -mx-4 flex justify-end gap-2 border-t bg-background/95 px-4 py-3 backdrop-blur md:-mx-6 md:px-6">
      <Button type="button" variant="outline" onClick={onCancel}>
        {somenteLeitura ? 'Voltar' : 'Cancelar'}
      </Button>
      {!somenteLeitura && (
        <Button type="submit" variant={extra ? 'outline' : 'default'} disabled={salvando}>
          {salvando && <Loader2Icon className="animate-spin" aria-hidden />}
          Salvar
        </Button>
      )}
      {!somenteLeitura && extra}
    </div>
  )
}
