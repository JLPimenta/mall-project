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
import com.smartmall.ops.domain.model.piso.MarcadoresResponse;
import com.smartmall.ops.domain.model.piso.PlantaDadosRequest;
import com.smartmall.ops.domain.model.piso.PlantaResponse;
import com.smartmall.ops.domain.model.tarefa.ArquivoEvidencia;
import com.smartmall.ops.domain.repository.arquivo.ArquivoRepository;
import com.smartmall.ops.domain.repository.chamado.LocalQrRepository;
import com.smartmall.ops.domain.repository.equipamento.EquipamentoRepository;
import com.smartmall.ops.domain.repository.piso.MarcadorPisoRepository;
import com.smartmall.ops.domain.repository.piso.PisoRepository;
import com.smartmall.ops.domain.repository.piso.PlantaPisoRepository;
import com.smartmall.ops.domain.service.tarefa.TipoImagem;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.util.HashSet;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

/** Planta (PDF + imagem) e marcadores do piso. Regras em docs/central-controle.md. */
@Service
@Transactional(readOnly = true)
public class PlantaPisoService {

    public static final int MAX_BYTES_PDF = 15 * 1024 * 1024;
    public static final int MAX_BYTES_IMAGEM = 5 * 1024 * 1024;
    public static final int MAX_NOME_ARQUIVO = 150;

    private final PisoRepository pisoRepository;
    private final PlantaPisoRepository plantaRepository;
    private final MarcadorPisoRepository marcadorRepository;
    private final EquipamentoRepository equipamentoRepository;
    private final LocalQrRepository localRepository;
    private final ArquivoRepository arquivoRepository;

    public PlantaPisoService(PisoRepository pisoRepository, PlantaPisoRepository plantaRepository, MarcadorPisoRepository marcadorRepository,
                             EquipamentoRepository equipamentoRepository, LocalQrRepository localRepository,
                             ArquivoRepository arquivoRepository) {
        this.pisoRepository = pisoRepository;
        this.plantaRepository = plantaRepository;
        this.marcadorRepository = marcadorRepository;
        this.equipamentoRepository = equipamentoRepository;
        this.localRepository = localRepository;
        this.arquivoRepository = arquivoRepository;
    }

    // ---- planta

    public PlantaResponse planta(String pisoId) {
        return PlantaResponse.de(buscarPlanta(pisoId));
    }

    /**
     * Grava (ou troca) a planta. O PDF é guardado como veio, para baixar; a imagem da página escolhida é o fundo
     * da visão do piso. Os marcadores são mantidos: as posições são relativas e continuam válidas para a mesma planta.
     */
    @Transactional
    public PlantaResponse salvarPlanta(String pisoId, String nomePdf, byte[] pdf, byte[] imagem, PlantaDadosRequest dados) {
        var piso = buscarPiso(pisoId);
        if (pdf == null || pdf.length == 0) throw new DomainException("Selecione o PDF da planta.");
        if (pdf.length > MAX_BYTES_PDF) throw new DomainException("O PDF deve ter no máximo 15 MB.");
        if (!ehPdf(pdf)) throw new DomainException("Envie a planta em PDF.");
        if (imagem == null || imagem.length == 0) throw new DomainException("Gere a imagem da planta antes de salvar.");
        if (imagem.length > MAX_BYTES_IMAGEM) throw new DomainException("A imagem da planta deve ter no máximo 5 MB.");
        var tipo = TipoImagem.detectar(imagem).orElseThrow(() -> new DomainException("A imagem da planta deve ser PNG, JPG ou WebP."));

        var planta = plantaRepository.findByPisoId(pisoId).orElseGet(() -> {
            var nova = new PlantaPiso();
            nova.setPiso(piso);
            return nova;
        });
        // Trocar a planta não deixa arquivos sem dono: os anteriores são apagados depois de gravar os novos.
        var anteriores = planta.getId() == null ? java.util.List.<Arquivo>of() : java.util.List.of(planta.getPdf(), planta.getImagem());
        planta.setPdf(new Arquivo(pdf));
        planta.setImagem(new Arquivo(imagem));
        planta.setNomeArquivo(nomeSeguro(nomePdf));
        planta.setTipoImagem(tipo.tipoConteudo());
        planta.setPagina(dados.getPagina());
        planta.setLargura(dados.getLargura());
        planta.setAltura(dados.getAltura());
        var salva = plantaRepository.saveAndFlush(planta);
        arquivoRepository.deleteAll(anteriores);
        return PlantaResponse.de(salva);
    }

    /** Remove a planta. Os marcadores ficam, para uma nova planta do mesmo piso. */
    @Transactional
    public void removerPlanta(String pisoId) {
        plantaRepository.delete(buscarPlanta(pisoId));
    }

    public ArquivoEvidencia imagem(String pisoId) {
        var planta = buscarPlanta(pisoId);
        var base = planta.getNomeArquivo().replaceAll("(?i)\\.pdf$", "");
        var extensao = planta.getTipoImagem().substring(planta.getTipoImagem().indexOf('/') + 1);
        return new ArquivoEvidencia(base + "." + extensao, planta.getTipoImagem(), planta.getImagem().getConteudo());
    }

    public ArquivoEvidencia pdf(String pisoId) {
        var planta = buscarPlanta(pisoId);
        return new ArquivoEvidencia(planta.getNomeArquivo(), "application/pdf", planta.getPdf().getConteudo());
    }

    // ---- marcadores

    /** Equipamentos e locais QR ativos do piso, com a posição quando marcada. */
    public MarcadoresResponse marcadores(String pisoId) {
        buscarPiso(pisoId);
        var posicoes = marcadorRepository.findByPisoId(pisoId).stream()
                .collect(Collectors.toMap(m -> m.getTipo() + ":" + m.getReferenciaId(), Function.identity()));
        var equipamentos = equipamentoRepository.findByPisoIdOrderByCodigoAsc(pisoId).stream()
                .map(e -> ponto(e.getId(), e.getCodigo(), e.getNome(), posicoes.get(TipoMarcador.EQUIPAMENTO + ":" + e.getId())))
                .toList();
        var locais = localRepository.findByPisoIdAndAtivoTrueOrderByNomeAsc(pisoId).stream()
                .map(l -> ponto(l.getId(), l.getCodigo(), l.getNome(), posicoes.get(TipoMarcador.LOCAL_QR + ":" + l.getId())))
                .toList();
        return new MarcadoresResponse(equipamentos, locais);
    }

    /** Substitui todos os marcadores do piso. Cada registro precisa ser deste piso e aparecer uma vez. */
    @Transactional
    public MarcadoresResponse salvarMarcadores(String pisoId, MarcadoresRequest request) {
        var piso = buscarPiso(pisoId);
        Map<String, Equipamento> equipamentos = equipamentoRepository.findByPisoIdOrderByCodigoAsc(pisoId).stream()
                .collect(Collectors.toMap(Equipamento::getId, Function.identity()));
        Map<String, LocalQr> locais = localRepository.findByPisoIdAndAtivoTrueOrderByNomeAsc(pisoId).stream()
                .collect(Collectors.toMap(LocalQr::getId, Function.identity()));
        var vistos = new HashSet<String>();
        for (MarcadorRequest m : request.getMarcadores()) {
            boolean doPiso = m.getTipo() == TipoMarcador.EQUIPAMENTO ? equipamentos.containsKey(m.getReferenciaId()) : locais.containsKey(m.getReferenciaId());
            if (!doPiso) throw new DomainException("O marcador precisa ser de um equipamento ou local deste piso.");
            if (!vistos.add(m.getTipo() + ":" + m.getReferenciaId())) throw new DomainException("Cada registro tem um único marcador.");
        }
        marcadorRepository.excluirDoPiso(pisoId);
        // Um equipamento que mudou de piso ainda pode ter marcador no piso antigo (único por registro).
        for (MarcadorRequest m : request.getMarcadores()) marcadorRepository.excluirDaReferencia(m.getTipo(), m.getReferenciaId());
        marcadorRepository.flush();
        for (MarcadorRequest m : request.getMarcadores()) {
            marcadorRepository.save(new MarcadorPiso(piso, m.getTipo(), m.getReferenciaId(), escala(m.getX()), escala(m.getY())));
        }
        marcadorRepository.flush();
        return marcadores(pisoId);
    }

    // ---- locais de QR Code

    /**
     * Cria um local de QR Code no piso (ativo). O código vem do nome, sem acentos ("Praça de Alimentação" →
     * "praca-de-alimentacao"); se já existir, ganha um número ("-2", "-3"…). A posição é gravada depois, com as demais.
     */
    @Transactional
    public MarcadoresResponse.Ponto criarLocal(String pisoId, String nome) {
        var piso = buscarPiso(pisoId);
        var texto = nome == null ? "" : nome.trim();
        if (texto.isEmpty()) throw new DomainException("Informe o nome do local.");
        if (texto.length() > 100) throw new DomainException("O nome deve ter até 100 caracteres.");
        var base = codigoDe(texto);
        var codigo = base;
        for (int n = 2; localRepository.existsByCodigo(codigo); n++) codigo = base + "-" + n;
        var local = new LocalQr();
        local.setCodigo(codigo);
        local.setNome(texto);
        local.setPiso(piso);
        local.setAtivo(Boolean.TRUE);
        var salvo = localRepository.save(local);
        return new MarcadoresResponse.Ponto(salvo.getId(), salvo.getCodigo(), salvo.getNome(), null, null);
    }

    /** Minúsculas, sem acentos, só letras, números e hífen; até 50 caracteres (sobra espaço para o sufixo). */
    static String codigoDe(String nome) {
        var semAcento = java.text.Normalizer.normalize(nome, java.text.Normalizer.Form.NFD).replaceAll("\\p{M}", "");
        var codigo = semAcento.toLowerCase(java.util.Locale.ROOT).replaceAll("[^a-z0-9]+", "-").replaceAll("(^-|-$)", "");
        if (codigo.length() > 50) codigo = codigo.substring(0, 50).replaceAll("-$", "");
        return codigo.isEmpty() ? "local" : codigo;
    }

    // ---- apoio

    private Piso buscarPiso(String pisoId) {
        return pisoRepository.findById(pisoId).orElseThrow(() -> new EntityNotFoundException("Piso não encontrado."));
    }

    private PlantaPiso buscarPlanta(String pisoId) {
        buscarPiso(pisoId);
        return plantaRepository.findByPisoId(pisoId).orElseThrow(() -> new EntityNotFoundException("Piso sem planta."));
    }

    private static MarcadoresResponse.Ponto ponto(String id, String codigo, String nome, MarcadorPiso marcador) {
        return new MarcadoresResponse.Ponto(id, codigo, nome, marcador == null ? null : marcador.getX(), marcador == null ? null : marcador.getY());
    }

    /** Quatro casas: precisão de 0,01% da planta, igual à coluna NUMERIC(5,4). */
    private static BigDecimal escala(BigDecimal valor) {
        return valor.setScale(4, RoundingMode.HALF_UP);
    }

    static boolean ehPdf(byte[] conteudo) {
        return conteudo.length >= 5 && "%PDF-".equals(new String(conteudo, 0, 5, StandardCharsets.US_ASCII));
    }

    static String nomeSeguro(String nome) {
        if (nome == null || nome.isBlank()) return "planta.pdf";
        var base = nome.substring(Math.max(nome.lastIndexOf('/'), nome.lastIndexOf('\\')) + 1).replaceAll("[\\p{Cntrl}\"]", "").trim();
        if (base.isBlank()) return "planta.pdf";
        return base.length() > MAX_NOME_ARQUIVO ? base.substring(base.length() - MAX_NOME_ARQUIVO) : base;
    }
}
