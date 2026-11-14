import { PencilIcon, Trash2Icon } from 'lucide-react'
import { Link } from 'react-router'
import { LinhaClicavel } from '@/components/shared/linha-clicavel'
import { useOrigemAtual } from '@/lib/navegacao'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { Equipe } from '../types'

type EquipeTableProps = {
  equipes: Equipe[]
  onExcluir: (equipe: Equipe) => void
}

export function EquipeTable({ equipes, onExcluir }: EquipeTableProps) {
  const origem = useOrigemAtual()
  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-56">Nome</TableHead>
            <TableHead>Membros</TableHead>
            <TableHead className="w-24">
              <span className="sr-only">Ações</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {equipes.map((e) => (
            <LinhaClicavel key={e.id} para={e.id}>
              <TableCell className="font-medium whitespace-normal">{e.nome}</TableCell>
              <TableCell className="whitespace-normal text-muted-foreground">
                {e.membros.length === 0 ? 'Sem membros' : e.membros.map((m) => m.nome).join(', ')}
              </TableCell>
              <TableCell>
                <div className="flex justify-end gap-1">
                  <Button asChild variant="ghost" size="icon-sm">
                    <Link to={e.id} state={origem} aria-label={`Editar ${e.nome}`}>
                      <PencilIcon aria-hidden />
                    </Link>
                  </Button>
                  <Button variant="ghost" size="icon-sm" aria-label={`Excluir ${e.nome}`} onClick={() => onExcluir(e)}>
                    <Trash2Icon aria-hidden />
                  </Button>
                </div>
              </TableCell>
            </LinhaClicavel>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
