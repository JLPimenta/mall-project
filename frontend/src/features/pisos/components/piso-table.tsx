import { PencilIcon, Trash2Icon } from 'lucide-react'
import { Link } from 'react-router'
import { LinhaClicavel } from '@/components/shared/linha-clicavel'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useOrigemAtual } from '@/lib/navegacao'
import type { Piso } from '../types'

type PisoTableProps = { pisos: Piso[]; onExcluir: (piso: Piso) => void }

export function PisoTable({ pisos, onExcluir }: PisoTableProps) {
  const origem = useOrigemAtual()
  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-24">Código</TableHead>
            <TableHead>Nome</TableHead>
            <TableHead className="w-20 text-right">Ordem</TableHead>
            <TableHead className="w-24">
              <span className="sr-only">Ações</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pisos.map((p) => (
            <LinhaClicavel key={p.id} para={p.id}>
              <TableCell className="font-mono text-xs">{p.codigo}</TableCell>
              <TableCell className="font-medium whitespace-normal">{p.nome}</TableCell>
              <TableCell className="text-right tabular-nums">{p.ordem}</TableCell>
              <TableCell>
                <div className="flex justify-end gap-1">
                  <Button asChild variant="ghost" size="icon-sm">
                    <Link to={p.id} state={origem} aria-label={`Editar ${p.nome}`}>
                      <PencilIcon aria-hidden />
                    </Link>
                  </Button>
                  <Button variant="ghost" size="icon-sm" aria-label={`Excluir ${p.nome}`} onClick={() => onExcluir(p)}>
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
