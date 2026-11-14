import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export type Tom = 'neutro' | 'info' | 'sucesso' | 'atencao' | 'perigo'

const tons: Record<Tom, string> = {
  neutro: 'border-border bg-muted text-muted-foreground',
  info: 'border-primary/30 bg-primary/10 text-primary',
  sucesso: 'border-success/30 bg-success/10 text-success',
  atencao: 'border-warning/40 bg-warning/15 text-foreground',
  perigo: 'border-destructive/30 bg-destructive/10 text-destructive',
}

/** Status com cor e texto padronizados. O texto sempre acompanha a cor (não depende só de cor). */
export function StatusBadge({ tom, children, className }: { tom: Tom; children: string; className?: string }) {
  return (
    <Badge variant="outline" className={cn('font-medium', tons[tom], className)}>
      {children}
    </Badge>
  )
}
