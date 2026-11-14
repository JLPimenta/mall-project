package com.smartmall.ops.domain.service.piso;

import com.smartmall.ops.domain.core.exception.DomainException;
import com.smartmall.ops.domain.entity.Arquivo;
import com.smartmall.ops.domain.entity.Equipamento;
import com.smartmall.ops.domain.entity.LocalQr;
import com.smartmall.ops.domain.entity.MarcadorPiso;
import com.smartmall.ops.domain.entity.Piso;
import com.smartmall.ops.domain.entity.PlantaPiso;
import com.smartmall.ops.domain.entity.enums.TipoMarcador;
import com.smartmall.ops.domain.model.piso.MarcadorRequest;
import com.smartmall.ops.domain.model.piso.MarcadoresRequest;
import com.smartmall.ops.domain.model.piso.PlantaDadosRequest;
import com.smartmall.ops.domain.repository.arquivo.ArquivoRepository;
import com.smartmall.ops.domain.repository.chamado.LocalQrRepository;
import com.smartmall.ops.domain.repository.equipamento.EquipamentoRepository;
import com.smartmall.ops.domain.repository.piso.MarcadorPisoRepository;
import com.smartmall.ops.domain.repository.piso.PisoRepository;
import com.smartmall.ops.domain.repository.piso.PlantaPisoRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PlantaPisoServiceTest {

    private static final byte[] PDF = "%PDF-1.7\n...".getBytes(StandardCharsets.US_ASCII);
    private static final byte[] PNG = {(byte) 0x89, 'P', 'N', 'G', '\r', '\n', 0x1A, '\n', 0, 0};
    private static final PlantaDadosRequest DADOS = new PlantaDadosRequest(1, 2400, 1600);

    @Mock private PisoRepository pisoRepository;
    @Mock private PlantaPisoRepository plantaRepository;
    @Mock private MarcadorPisoRepository marcadorRepository;
    @Mock private EquipamentoRepository equipamentoRepository;
    @Mock private LocalQrRepository localRepository;
    @Mock private ArquivoRepository arquivoRepository;

    private PlantaPisoService service;
    private Piso piso;

    @BeforeEach
    void setUp() {
        service = new PlantaPisoService(pisoRepository, plantaRepository, marcadorRepository, equipamentoRepository, localRepository, arquivoRepository);
        piso = new Piso("L2", "Piso L2", 2);
        piso.setId("p2");
        lenient().when(pisoRepository.findById("p2")).thenReturn(Optional.of(piso));
        lenient().when(plantaRepository.saveAndFlush(any())).thenAnswer(i -> i.getArgument(0));
    }

    private Equipamento equipamento(String id) {
        var e = new Equipamento(id.toUpperCase(), "Equip " + id, null, piso, "Praça", null);
        e.setId(id);
        return e;
    }

    private LocalQr local(String id) {
        var l = new LocalQr();
        l.setId(id);
        l.setCodigo(id);
        l.setNome("Local " + id);
        l.setPiso(piso);
        return l;
    }

    // ---- planta

    @Test
    void salvaPlantaComPdfEImagemIdentificados() {
        when(plantaRepository.findByPisoId("p2")).thenReturn(Optional.empty());

        var resposta = service.salvarPlanta("p2", "C:\\plantas\\2026_11_CDS_MIX.pdf", PDF, PNG, DADOS);

        assertThat(resposta.nomeArquivo()).isEqualTo("2026_11_CDS_MIX.pdf");
        assertThat(resposta.largura()).isEqualTo(2400);
        var captor = ArgumentCaptor.forClass(PlantaPiso.class);
        verify(plantaRepository).saveAndFlush(captor.capture());
        assertThat(captor.getValue().getPiso()).isSameAs(piso);
        assertThat(captor.getValue().getTipoImagem()).isEqualTo("image/png");
        verify(arquivoRepository).deleteAll(List.of());
    }

    @Test
    void trocarAPlantaApagaOsArquivosAnteriores() {
        var existente = new PlantaPiso();
        existente.setId("pl1");
        var pdfAntigo = new Arquivo(PDF);
        var imagemAntiga = new Arquivo(PNG);
        existente.setPdf(pdfAntigo);
        existente.setImagem(imagemAntiga);
        when(plantaRepository.findByPisoId("p2")).thenReturn(Optional.of(existente));

        service.salvarPlanta("p2", "nova.pdf", PDF, PNG, DADOS);

        verify(arquivoRepository).deleteAll(List.of(pdfAntigo, imagemAntiga));
        assertThat(existente.getPdf()).isNotSameAs(pdfAntigo);
    }

    @Test
    void recusaArquivoQueNaoEhPdfOuImagemInvalida() {
        assertThatThrownBy(() -> service.salvarPlanta("p2", "planta.pdf", PNG, PNG, DADOS)).hasMessage("Envie a planta em PDF.");
        assertThatThrownBy(() -> service.salvarPlanta("p2", "planta.pdf", PDF, PDF, DADOS)).hasMessage("A imagem da planta deve ser PNG, JPG ou WebP.");
        assertThatThrownBy(() -> service.salvarPlanta("p2", "planta.pdf", new byte[0], PNG, DADOS)).hasMessage("Selecione o PDF da planta.");
        var grande = new byte[PlantaPisoService.MAX_BYTES_PDF + 1];
        System.arraycopy(PDF, 0, grande, 0, PDF.length);
        assertThatThrownBy(() -> service.salvarPlanta("p2", "planta.pdf", grande, PNG, DADOS)).hasMessage("O PDF deve ter no máximo 15 MB.");
        verify(plantaRepository, never()).saveAndFlush(any());
    }

    @Test
    void pisoSemPlantaRespondeNaoEncontrado() {
        when(plantaRepository.findByPisoId("p2")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.planta("p2")).isInstanceOf(EntityNotFoundException.class).hasMessage("Piso sem planta.");
    }

    @Test
    void nomeDoArquivoPerdeCaminho() {
        assertThat(PlantaPisoService.nomeSeguro("/x/../planta.pdf")).isEqualTo("planta.pdf");
        assertThat(PlantaPisoService.nomeSeguro(" ")).isEqualTo("planta.pdf");
        assertThat(PlantaPisoService.nomeSeguro("a".repeat(200) + ".pdf")).hasSize(150).endsWith(".pdf");
    }

    // ---- marcadores

    @Test
    void listaEquipamentosELocaisDoPisoComAPosicaoQuandoMarcada() {
        when(equipamentoRepository.findByPisoIdOrderByCodigoAsc("p2")).thenReturn(List.of(equipamento("e1"), equipamento("e2")));
        when(localRepository.findByPisoIdAndAtivoTrueOrderByNomeAsc("p2")).thenReturn(List.of(local("q1")));
        when(marcadorRepository.findByPisoId("p2")).thenReturn(List.of(
                new MarcadorPiso(piso, TipoMarcador.EQUIPAMENTO, "e2", new BigDecimal("0.2500"), new BigDecimal("0.7500"))));

        var resposta = service.marcadores("p2");

        assertThat(resposta.equipamentos()).extracting(p -> p.x()).containsExactly(null, new BigDecimal("0.2500"));
        assertThat(resposta.locais()).singleElement().satisfies(l -> assertThat(l.x()).isNull());
    }

    @Test
    void salvarMarcadoresSubstituiOsDoPisoELiberaOsDeOutroPiso() {
        when(equipamentoRepository.findByPisoIdOrderByCodigoAsc("p2")).thenReturn(List.of(equipamento("e1")));
        when(localRepository.findByPisoIdAndAtivoTrueOrderByNomeAsc("p2")).thenReturn(List.of(local("q1")));
        var salvos = new ArrayList<MarcadorPiso>();
        when(marcadorRepository.save(any())).thenAnswer(i -> {
            salvos.add(i.getArgument(0));
            return i.getArgument(0);
        });

        service.salvarMarcadores("p2", new MarcadoresRequest(List.of(
                new MarcadorRequest(TipoMarcador.EQUIPAMENTO, "e1", new BigDecimal("0.123456"), new BigDecimal("0.5")),
                new MarcadorRequest(TipoMarcador.LOCAL_QR, "q1", new BigDecimal("1"), BigDecimal.ZERO))));

        verify(marcadorRepository).excluirDoPiso("p2");
        verify(marcadorRepository).excluirDaReferencia(TipoMarcador.EQUIPAMENTO, "e1");
        assertThat(salvos).extracting(MarcadorPiso::getX).containsExactly(new BigDecimal("0.1235"), new BigDecimal("1.0000"));
    }

    @Test
    void recusaMarcadorDeOutroPisoOuRepetido() {
        when(equipamentoRepository.findByPisoIdOrderByCodigoAsc("p2")).thenReturn(List.of(equipamento("e1")));
        when(localRepository.findByPisoIdAndAtivoTrueOrderByNomeAsc("p2")).thenReturn(List.of());
        var ponto = new MarcadorRequest(TipoMarcador.EQUIPAMENTO, "e1", BigDecimal.ONE, BigDecimal.ONE);

        assertThatThrownBy(() -> service.salvarMarcadores("p2", new MarcadoresRequest(List.of(
                new MarcadorRequest(TipoMarcador.EQUIPAMENTO, "de-outro-piso", BigDecimal.ONE, BigDecimal.ONE)))))
                .isInstanceOf(DomainException.class)
                .hasMessage("O marcador precisa ser de um equipamento ou local deste piso.");
        assertThatThrownBy(() -> service.salvarMarcadores("p2", new MarcadoresRequest(List.of(ponto, ponto))))
                .hasMessage("Cada registro tem um único marcador.");
        verify(marcadorRepository, never()).excluirDoPiso(any());
    }

    // ---- locais de QR Code

    @Test
    void criaLocalNoPisoComCodigoDoNomeSemRepetir() {
        when(localRepository.existsByCodigo("quiosque-cafe-central")).thenReturn(true);
        when(localRepository.existsByCodigo("quiosque-cafe-central-2")).thenReturn(false);
        when(localRepository.save(any())).thenAnswer(i -> {
            LocalQr l = i.getArgument(0);
            l.setId("q9");
            return l;
        });

        var ponto = service.criarLocal("p2", "  Quiosque Café Central ");

        assertThat(ponto.codigo()).isEqualTo("quiosque-cafe-central-2");
        assertThat(ponto.nome()).isEqualTo("Quiosque Café Central");
        assertThat(ponto.x()).isNull();
        var captor = ArgumentCaptor.forClass(LocalQr.class);
        verify(localRepository).save(captor.capture());
        assertThat(captor.getValue().getPiso()).isSameAs(piso);
        assertThat(captor.getValue().getAtivo()).isTrue();
    }

    @Test
    void localExigeNome() {
        assertThatThrownBy(() -> service.criarLocal("p2", "  ")).hasMessage("Informe o nome do local.");
        verify(localRepository, never()).save(any());
    }

    @Test
    void codigoDoLocalSoTemLetrasNumerosEHifen() {
        assertThat(PlantaPisoService.codigoDe("Praça de Alimentação — Ala B!")).isEqualTo("praca-de-alimentacao-ala-b");
        assertThat(PlantaPisoService.codigoDe("???")).isEqualTo("local");
        assertThat(PlantaPisoService.codigoDe("a ".repeat(60))).hasSizeLessThanOrEqualTo(50).doesNotEndWith("-");
    }
}
