package com.smartmall.ops.domain.service.piso;

import com.smartmall.ops.domain.entity.Chamado;
import com.smartmall.ops.domain.entity.MarcadorPiso;
import com.smartmall.ops.domain.entity.Tarefa;
import com.smartmall.ops.domain.entity.enums.StatusChamado;
import com.smartmall.ops.domain.entity.enums.StatusTarefa;
import com.smartmall.ops.domain.entity.enums.TipoMarcador;
import com.smartmall.ops.domain.model.piso.MapaPisoResponse;
import com.smartmall.ops.domain.model.piso.MapaPisoResponse.ChamadoNoMapa;
import com.smartmall.ops.domain.model.piso.MapaPisoResponse.EquipamentoNoMapa;
import com.smartmall.ops.domain.model.piso.MapaPisoResponse.TarefaDoDia;
import com.smartmall.ops.domain.model.piso.PlantaResponse;
import com.smartmall.ops.domain.repository.chamado.ChamadoRepository;
import com.smartmall.ops.domain.repository.equipamento.EquipamentoRepository;
import com.smartmall.ops.domain.repository.piso.MarcadorPisoRepository;
import com.smartmall.ops.domain.repository.piso.PisoRepository;
import com.smartmall.ops.domain.repository.piso.PlantaPisoRepository;
import com.smartmall.ops.domain.repository.tarefa.TarefaRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

/** Monta a visão do piso da Central: equipamentos (com tarefas do dia e atrasadas) e chamados abertos. */
@Service
@Transactional(readOnly = true)
public class MapaPisoService {

    static final Set<StatusChamado> ABERTOS = Set.of(StatusChamado.REGISTRADA, StatusChamado.EM_ANALISE,
            StatusChamado.APROVADA, StatusChamado.EM_EXECUCAO);

    private final PisoRepository pisoRepository;
    private final PlantaPisoRepository plantaRepository;
    private final MarcadorPisoRepository marcadorRepository;
    private final EquipamentoRepository equipamentoRepository;
    private final TarefaRepository tarefaRepository;
    private final ChamadoRepository chamadoRepository;
    private final Clock clock;

    public MapaPisoService(PisoRepository pisoRepository, PlantaPisoRepository plantaRepository, MarcadorPisoRepository marcadorRepository,
                           EquipamentoRepository equipamentoRepository, TarefaRepository tarefaRepository,
                           ChamadoRepository chamadoRepository, Clock clock) {
        this.pisoRepository = pisoRepository;
        this.plantaRepository = plantaRepository;
        this.marcadorRepository = marcadorRepository;
        this.equipamentoRepository = equipamentoRepository;
        this.tarefaRepository = tarefaRepository;
        this.chamadoRepository = chamadoRepository;
        this.clock = clock;
    }

    public MapaPisoResponse mapa(String pisoId) {
        var piso = pisoRepository.findById(pisoId).orElseThrow(() -> new EntityNotFoundException("Piso não encontrado."));
        var agora = LocalDateTime.now(clock);
        var hoje = LocalDate.now(clock);
        var planta = plantaRepository.findByPisoId(pisoId).map(PlantaResponse::de).orElse(null);
        Map<String, MarcadorPiso> posicoes = marcadorRepository.findByPisoId(pisoId).stream()
                .collect(Collectors.toMap(m -> m.getTipo() + ":" + m.getReferenciaId(), Function.identity()));

        // Tarefas do piso: as de hoje e as atrasadas (até um ano, mesma janela do indicador da tela Tarefas).
        var tarefas = tarefaRepository.buscar(hoje.minusYears(1).atStartOfDay(), hoje.plusDays(1).atStartOfDay(), null, null, null).stream()
                .filter(t -> t.equipamentoEfetivo() != null && pisoId.equals(t.equipamentoEfetivo().getPiso().getId()))
                .collect(Collectors.groupingBy(t -> t.equipamentoEfetivo().getId()));

        int semPosicao = 0;
        var equipamentos = new java.util.ArrayList<EquipamentoNoMapa>();
        for (var e : equipamentoRepository.findByPisoIdOrderByCodigoAsc(pisoId)) {
            var marcador = posicoes.get(TipoMarcador.EQUIPAMENTO + ":" + e.getId());
            if (marcador == null) {
                semPosicao++;
                continue;
            }
            var doEquipamento = tarefas.getOrDefault(e.getId(), List.of());
            int atrasadas = (int) doEquipamento.stream().filter(t -> t.isAtrasada(agora)).count();
            var hojeLista = doEquipamento.stream()
                    .filter(t -> t.getDataHoraPrevista().toLocalDate().equals(hoje) && t.getStatus() != StatusTarefa.CANCELADA)
                    .map(t -> tarefaDoDia(t, agora))
                    .toList();
            equipamentos.add(new EquipamentoNoMapa(e.getId(), e.getCodigo(), e.getNome(), e.getCondicao(),
                    marcador.getX(), marcador.getY(), atrasadas, hojeLista));
        }

        var chamados = new java.util.ArrayList<ChamadoNoMapa>();
        for (Chamado c : chamadoRepository.findByLocalQrPisoIdAndStatusIn(pisoId, ABERTOS)) {
            var marcador = posicoes.get(TipoMarcador.LOCAL_QR + ":" + c.getLocalQr().getId());
            if (marcador == null) {
                semPosicao++;
                continue;
            }
            var prioridade = c.getPrioridadeConfirmada() != null ? c.getPrioridadeConfirmada() : c.getPrioridadeSugerida();
            chamados.add(new ChamadoNoMapa(c.getId(), c.getProtocolo(), c.getStatus(), prioridade, resumo(c.getDescricao()),
                    c.getLocalQr().getNome(), c.getDataCriacao(), marcador.getX(), marcador.getY()));
        }
        return new MapaPisoResponse(piso.getId(), piso.getNome(), planta, equipamentos, chamados, semPosicao);
    }

    private static TarefaDoDia tarefaDoDia(Tarefa t, LocalDateTime agora) {
        return new TarefaDoDia(t.getId(), t.getDataHoraPrevista(), t.getStatus(), t.isAtrasada(agora),
                t.equipeEfetiva() == null ? null : t.equipeEfetiva().getNome(),
                t.getResponsavel() == null ? null : t.getResponsavel().getNome());
    }

    /** Primeiros 140 caracteres do relato, para o painel do marcador. */
    static String resumo(String texto) {
        if (texto == null) return "";
        return texto.length() <= 140 ? texto : texto.substring(0, 139).trim() + "…";
    }
}
