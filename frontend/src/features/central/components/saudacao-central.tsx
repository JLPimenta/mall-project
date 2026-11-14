import { useState } from 'react'
import { useSessao } from '@/features/auth/hooks'
import { useAgora } from '@/lib/use-agora'
import { saudacao } from '../saudacoes'

/** "Boa tarde, Ana." com uma frase que varia a cada visita. */
export function SaudacaoCentral() {
  const { data: usuario } = useSessao()
  const agora = useAgora()
  // Sorteado uma vez por visita: a frase não troca enquanto a tela está aberta.
  const [sorteio] = useState(() => Math.random())
  if (!usuario) return null
  const { titulo, subtitulo } = saudacao(usuario.nome, agora.getHours(), sorteio)

  return (
    <div className="grid gap-1">
      <p className="text-2xl font-semibold tracking-tight sm:text-3xl">{titulo}</p>
      <p className="text-muted-foreground">{subtitulo}</p>
    </div>
  )
}
