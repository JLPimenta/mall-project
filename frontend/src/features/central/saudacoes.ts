/**
 * Saudação da Central de Controle: muda com a hora do dia e varia a cada visita, para a tela não parecer
 * sempre igual. Frases curtas, sem prometer nada que a tela não mostra.
 */
type Saudacao = { titulo: (nome: string) => string; subtitulo: string }

const POR_PERIODO: Record<'manha' | 'tarde' | 'noite', Saudacao[]> = {
  manha: [
    { titulo: (n) => `Bom dia, ${n}.`, subtitulo: 'Vamos ver como a operação começou?' },
    { titulo: (n) => `Bom dia, ${n}.`, subtitulo: 'O que precisa de atenção logo cedo?' },
    { titulo: (n) => `Olá, ${n}.`, subtitulo: 'Tudo pronto para o dia no shopping.' },
  ],
  tarde: [
    { titulo: (n) => `Boa tarde, ${n}.`, subtitulo: 'Como está a operação agora?' },
    { titulo: (n) => `Olá, ${n}.`, subtitulo: 'Vamos acompanhar o andamento da tarde?' },
    { titulo: (n) => `De volta, ${n}?`, subtitulo: 'Veja o que mudou desde a última olhada.' },
  ],
  noite: [
    { titulo: (n) => `Boa noite, ${n}.`, subtitulo: 'Vamos fechar o dia com tudo em ordem?' },
    { titulo: (n) => `Olá, ${n}.`, subtitulo: 'Um resumo rápido antes de encerrar.' },
    { titulo: (n) => `Boa noite, ${n}.`, subtitulo: 'O que ainda está em aberto hoje?' },
  ],
}

function periodo(hora: number) {
  if (hora >= 5 && hora < 12) return 'manha'
  if (hora >= 12 && hora < 18) return 'tarde'
  return 'noite'
}

/** `sorteio` (0 a 1) escolhe a variação; fica fixo durante a visita. */
export function saudacao(nomeCompleto: string, hora: number, sorteio: number) {
  const opcoes = POR_PERIODO[periodo(hora)]
  const escolhida = opcoes[Math.floor(sorteio * opcoes.length) % opcoes.length]
  const nome = nomeCompleto.trim().split(/\s+/)[0] || nomeCompleto
  return { titulo: escolhida.titulo(nome), subtitulo: escolhida.subtitulo }
}
