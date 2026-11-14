package com.smartmall.ops.api.controller.piso;

import com.smartmall.ops.domain.core.controller.BaseController;
import com.smartmall.ops.domain.entity.Piso;
import com.smartmall.ops.domain.model.piso.IPisoMapper;
import com.smartmall.ops.domain.model.piso.MapaPisoResponse;
import com.smartmall.ops.domain.model.piso.MarcadoresRequest;
import com.smartmall.ops.domain.model.piso.MarcadoresResponse;
import com.smartmall.ops.domain.model.piso.NovoLocalRequest;
import com.smartmall.ops.domain.model.piso.PisoRequest;
import com.smartmall.ops.domain.model.piso.PisoResponse;
import com.smartmall.ops.domain.model.piso.PlantaDadosRequest;
import com.smartmall.ops.domain.model.piso.PlantaResponse;
import com.smartmall.ops.domain.model.tarefa.ArquivoEvidencia;
import com.smartmall.ops.domain.service.piso.IPisoService;
import com.smartmall.ops.domain.service.piso.MapaPisoService;
import com.smartmall.ops.domain.service.piso.PlantaPisoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.CacheControl;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

/**
 * Pisos: cadastro, planta (PDF + imagem) e marcadores. Consulta: qualquer perfil logado.
 * Cadastro, planta, marcadores e mapa: Administrador e Supervisor (SecurityConfiguration).
 */
@RestController
@RequestMapping(value = "/api/piso", produces = "application/json")
@Tag(name = "Piso", description = "Pisos, planta e marcadores da Central de Controle.")
public class PisoController extends BaseController<Piso, PisoRequest, PisoResponse> {

    private final PlantaPisoService plantaService;
    private final MapaPisoService mapaService;

    protected PisoController(final IPisoMapper mapper, final IPisoService service, final PlantaPisoService plantaService,
                             final MapaPisoService mapaService) {
        super(mapper, service);
        this.plantaService = plantaService;
        this.mapaService = mapaService;
    }

    @GetMapping("/{id}/planta")
    @Operation(description = "Dados da planta (404 se o piso ainda não tem planta).")
    public PlantaResponse planta(@PathVariable String id) {
        return plantaService.planta(id);
    }

    @PutMapping(value = "/{id}/planta", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(description = "Grava a planta: PDF original (até 15 MB) e a página escolhida em imagem (até 5 MB), gerada no navegador.")
    public PlantaResponse salvarPlanta(@PathVariable String id, @Valid @RequestPart("dados") PlantaDadosRequest dados,
                                       @RequestPart("pdf") MultipartFile pdf, @RequestPart("imagem") MultipartFile imagem) throws IOException {
        return plantaService.salvarPlanta(id, pdf.getOriginalFilename(), pdf.getBytes(), imagem.getBytes(), dados);
    }

    @DeleteMapping("/{id}/planta")
    @Operation(description = "Remove a planta (os marcadores são mantidos).")
    public ResponseEntity<Void> removerPlanta(@PathVariable String id) {
        plantaService.removerPlanta(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping(value = "/{id}/planta/imagem", produces = MediaType.ALL_VALUE)
    @Operation(description = "Imagem da planta (fundo da visão do piso).")
    public ResponseEntity<byte[]> imagem(@PathVariable String id) {
        return arquivo(plantaService.imagem(id), ContentDisposition.inline());
    }

    @GetMapping(value = "/{id}/planta/pdf", produces = MediaType.ALL_VALUE)
    @Operation(description = "PDF original da planta, para baixar.")
    public ResponseEntity<byte[]> pdf(@PathVariable String id) {
        return arquivo(plantaService.pdf(id), ContentDisposition.attachment());
    }

    @GetMapping("/{id}/marcadores")
    @Operation(description = "Equipamentos e locais QR do piso, com a posição na planta quando marcada.")
    public MarcadoresResponse marcadores(@PathVariable String id) {
        return plantaService.marcadores(id);
    }

    @PutMapping(value = "/{id}/marcadores", consumes = MediaType.APPLICATION_JSON_VALUE)
    @Operation(description = "Substitui as posições dos marcadores do piso.")
    public MarcadoresResponse salvarMarcadores(@PathVariable String id, @Valid @RequestBody MarcadoresRequest request) {
        return plantaService.salvarMarcadores(id, request);
    }

    @PostMapping(value = "/{id}/locais", consumes = MediaType.APPLICATION_JSON_VALUE)
    @Operation(description = "Cria um local de QR Code no piso; o código do QR é gerado pelo nome.")
    public MarcadoresResponse.Ponto criarLocal(@PathVariable String id, @Valid @RequestBody NovoLocalRequest request) {
        return plantaService.criarLocal(id, request.getNome());
    }

    @GetMapping("/{id}/mapa")
    @Operation(description = "Visão do piso para a Central de Controle: planta, equipamentos (tarefas do dia e atrasadas) e chamados abertos.")
    public MapaPisoResponse mapa(@PathVariable String id) {
        return mapaService.mapa(id);
    }

    private static ResponseEntity<byte[]> arquivo(ArquivoEvidencia arquivo, ContentDisposition.Builder disposicao) {
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(arquivo.tipoConteudo()))
                .header(HttpHeaders.CONTENT_DISPOSITION, disposicao.filename(arquivo.nomeArquivo(), StandardCharsets.UTF_8).build().toString())
                .cacheControl(CacheControl.noCache().cachePrivate())
                .body(arquivo.conteudo());
    }
}
