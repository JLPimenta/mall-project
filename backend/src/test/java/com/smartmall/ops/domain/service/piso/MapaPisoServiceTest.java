package com.smartmall.ops.domain.service.piso;

import com.smartmall.ops.domain.entity.Chamado;
import com.smartmall.ops.domain.entity.Checklist;
import com.smartmall.ops.domain.entity.Equipamento;
import com.smartmall.ops.domain.entity.Equipe;
import com.smartmall.ops.domain.entity.LocalQr;
import com.smartmall.ops.domain.entity.ManutencaoProgramada;
import com.smartmall.ops.domain.entity.MarcadorPiso;
import com.smartmall.ops.domain.entity.Piso;
import com.smartmall.ops.domain.entity.Tarefa;
import com.smartmall.ops.domain.entity.enums.CondicaoEquipamento;
import com.smartmall.ops.domain.entity.enums.PrioridadeChamado;
import com.smartmall.ops.domain.entity.enums.StatusChamado;
import com.smartmall.ops.domain.entity.enums.StatusTarefa;
import com.smartmall.ops.domain.entity.enums.TipoMarcador;
import com.smartmall.ops.domain.repository.chamado.ChamadoRepository;
import com.smartmall.ops.domain.repository.equipamento.EquipamentoRepository;
import com.smartmall.ops.domain.repository.piso.MarcadorPisoRepository;
import com.smartmall.ops.domain.repository.piso.PisoRepository;
import com.smartmall.ops.domain.repository.piso.PlantaPisoRepository;
import com.smartmall.ops.domain.repository.tarefa.TarefaRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MapaPisoServiceTest {

    private static final ZoneId FUSO = ZoneId.of("America/Araguaina");
    private static final LocalDateTime AGORA = LocalDateTime.of(2026, 11, 14, 10, 0);

    @Mock private PisoRepository pisoRepository;
    @Mock private PlantaPisoRepository plantaRepository;
    @Mock private MarcadorPisoRepository marcadorRepository;
    @Mock private EquipamentoRepository equipamentoRepository;
    @Mock private TarefaRepository tarefaRepository;
    @Mock private ChamadoRepository chamadoRepository;

    private MapaPisoService service;
    private Piso piso;
    private Equipamento elevador;
    private Equipamento bomba;

    @BeforeEach
    void setUp() {
        service = new MapaPisoService(pisoRepository, plantaRepository, marcadorRepository, equipamentoRepository,
                tarefaRepository, chamadoRepository, Clock.fixed(AGORA.atZone(FUSO).toInstant(), FUSO));
        piso = new Piso("L2", "Piso L2", 2);
        piso.setId("p2");
        elevador = new Equipamento("ELV-E1", "Elevador E1", null, piso, "Praça", CondicaoEquipamento.ATENCAO);
        elevador.setId("e1");
        bomba = new Equipamento("BOM-B01", "Bomba", null, piso, "Casa de bombas", CondicaoEquipamento.OPERANDO);
        bomba.setId("e2");
        when(pisoRepository.findById("p2")).thenReturn(Optional.of(piso));
        when(plantaRepository.findByPisoId("p2")).thenReturn(Optional.empty());
        when(equipamentoRepository.findByPisoIdOrderByCodigoAsc("p2")).thenReturn(List.of(elevador, bomba));
    }

    private Tarefa tarefa(String id, Equipamento equipamento, LocalDateTime quando, StatusTarefa status) {
        var programada = new ManutencaoProgramada();
        programada.setEquipamento(equipamento);
        programada.setEquipe(new Equipe("Elevadores", List.of()));
        programada.setChecklist(new Checklist());
        var t = new Tarefa(programada, quando);
        t.setId(id);
        t.setStatus(status);
        return t;
    }

    @Test
    void equipamentoPosicionadoTrazTarefasDeHojeEAtrasadas() {
        when(marcadorRepository.findByPisoId("p2")).thenReturn(List.of(
                new MarcadorPiso(piso, TipoMarcador.EQUIPAMENTO, "e1", new BigDecimal("0.4"), new BigDecimal("0.6"))));
        when(tarefaRepository.buscar(any(), eq(AGORA.toLocalDate().plusDays(1).atStartOfDay()), any(), any(), any())).thenReturn(List.of(
                tarefa("ontem", elevador, AGORA.minusDays(1), StatusTarefa.AGENDADA),
                tarefa("hoje", elevador, AGORA.plusHours(2), StatusTarefa.AGENDADA),
                tarefa("cancelada", elevador, AGORA.plusHours(3), StatusTarefa.CANCELADA)));
        when(chamadoRepository.findByLocalQrPisoIdAndStatusIn(eq("p2"), any())).thenReturn(List.of());

        var mapa = service.mapa("p2");

        assertThat(mapa.equipamentos()).singleElement().satisfies(e -> {
            assertThat(e.codigo()).isEqualTo("ELV-E1");
            assertThat(e.atrasadas()).isEqualTo(1);
            assertThat(e.tarefasHoje()).extracting(t -> t.id()).containsExactly("hoje");
        });
        // A bomba ainda não foi posicionada.
        assertThat(mapa.semPosicao()).isEqualTo(1);
    }

    @Test
    void chamadoAbertoApareceNoPontoDoQrComAPrioridadeConfirmada() {
        var local = new LocalQr();
        local.setId("q1");
        local.setNome("Banheiro norte");
        local.setPiso(piso);
        var chamado = new Chamado();
        chamado.setId("c1");
        chamado.setProtocolo("CH-1");
        chamado.setStatus(StatusChamado.EM_ANALISE);
        chamado.setLocalQr(local);
        chamado.setDescricao("Vazamento ".repeat(30));
        chamado.setPrioridadeSugerida(PrioridadeChamado.MEDIA);
        chamado.setPrioridadeConfirmada(PrioridadeChamado.ALTA);
        when(marcadorRepository.findByPisoId("p2")).thenReturn(List.of(
                new MarcadorPiso(piso, TipoMarcador.LOCAL_QR, "q1", new BigDecimal("0.1"), new BigDecimal("0.2"))));
        when(tarefaRepository.buscar(any(), any(), any(), any(), any())).thenReturn(List.of());
        when(chamadoRepository.findByLocalQrPisoIdAndStatusIn("p2", MapaPisoService.ABERTOS)).thenReturn(List.of(chamado));

        var mapa = service.mapa("p2");

        assertThat(mapa.chamados()).singleElement().satisfies(c -> {
            assertThat(c.prioridade()).isEqualTo(PrioridadeChamado.ALTA);
            assertThat(c.local()).isEqualTo("Banheiro norte");
            assertThat(c.resumo()).hasSize(140).endsWith("…");
        });
        assertThat(mapa.semPosicao()).isEqualTo(2);
    }
}
