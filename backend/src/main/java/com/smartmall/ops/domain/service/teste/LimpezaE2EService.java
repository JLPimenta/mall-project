package com.smartmall.ops.domain.service.teste;

import com.smartmall.ops.domain.core.exception.DomainException;
import com.smartmall.ops.domain.entity.ManutencaoProgramada;
import com.smartmall.ops.domain.repository.arquivo.ArquivoRepository;
import com.smartmall.ops.domain.repository.estoque.ItemEstoqueRepository;
import com.smartmall.ops.domain.repository.estoque.MovimentacaoEstoqueRepository;
import com.smartmall.ops.domain.repository.manutencao.ManutencaoProgramadaRepository;
import com.smartmall.ops.domain.repository.tarefa.TarefaEvidenciaRepository;
import com.smartmall.ops.domain.repository.tarefa.TarefaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.regex.Pattern;

/**
 * Apaga os dados criados por um teste E2E, inclusive tarefas executadas, que a regra de negócio
 * protege da exclusão (histórico). Só alcança registros com a marca do teste nas observações;
 * o endpoint que o expõe existe apenas no perfil dev (LimpezaE2EController).
 */
@Service
public class LimpezaE2EService {

    /** Formato de marcaUnica() em frontend/e2e/support/programadas.ts. */
    private static final Pattern MARCA = Pattern.compile("E2E-[A-Z0-9]{4,20}");

    private final ManutencaoProgramadaRepository programadaRepository;
    private final TarefaRepository tarefaRepository;
    private final TarefaEvidenciaRepository evidenciaRepository;
    private final ArquivoRepository arquivoRepository;
    private final ItemEstoqueRepository itemRepository;
    private final MovimentacaoEstoqueRepository movimentacaoRepository;

    public LimpezaE2EService(ManutencaoProgramadaRepository programadaRepository, TarefaRepository tarefaRepository,
                             TarefaEvidenciaRepository evidenciaRepository, ArquivoRepository arquivoRepository,
                             ItemEstoqueRepository itemRepository, MovimentacaoEstoqueRepository movimentacaoRepository) {
        this.programadaRepository = programadaRepository;
        this.tarefaRepository = tarefaRepository;
        this.evidenciaRepository = evidenciaRepository;
        this.arquivoRepository = arquivoRepository;
        this.itemRepository = itemRepository;
        this.movimentacaoRepository = movimentacaoRepository;
    }

    /** Apaga manutenções programadas (observação = marca) e itens de estoque (código = marca). @return quantas manutenções foram apagadas. */
    @Transactional
    public int excluirMarcados(String marca) {
        if (marca == null || !MARCA.matcher(marca).matches()) {
            throw new DomainException("Marca de teste inválida.");
        }
        var programadas = programadaRepository.findByObservacoes(marca);
        for (ManutencaoProgramada programada : programadas) {
            var arquivos = evidenciaRepository.arquivosDaProgramada(programada.getId());
            // Itens, evidências e histórico saem junto com a tarefa (ON DELETE CASCADE no banco).
            tarefaRepository.excluirDaProgramada(programada.getId());
            arquivoRepository.deleteAllByIdInBatch(arquivos);
            programadaRepository.delete(programada);
        }
        // Itens de estoque do teste usam a marca como código; as movimentações saem junto (rastreabilidade de teste).
        for (var item : itemRepository.findByCodigo(marca)) {
            movimentacaoRepository.excluirDoItem(item.getId());
            itemRepository.delete(item);
        }
        return programadas.size();
    }
}
