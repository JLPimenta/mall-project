package com.smartmall.ops.api.controller.piso;

import com.smartmall.ops.api.config.security.PasswordConfiguration;
import com.smartmall.ops.api.config.security.SecurityConfiguration;
import com.smartmall.ops.api.config.web.WebConfiguration;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.test.context.support.WithAnonymousUser;
import org.springframework.security.test.context.support.WithMockUser;
import com.smartmall.ops.domain.entity.Piso;
import com.smartmall.ops.domain.model.piso.IPisoMapperImpl;
import com.smartmall.ops.domain.service.piso.IPisoService;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Sobe a camada web real (controller, advice, serialização), sem banco. */
@WebMvcTest(PisoController.class)
@Import({IPisoMapperImpl.class, WebConfiguration.class, SecurityConfiguration.class, PasswordConfiguration.class})
@WithMockUser
class PisoControllerTest {

    @Autowired
    private MockMvc mvc;

    @MockitoBean
    private IPisoService service;

    @MockitoBean
    private com.smartmall.ops.domain.service.piso.PlantaPisoService plantaService;

    @MockitoBean
    private com.smartmall.ops.domain.service.piso.MapaPisoService mapaService;

    @MockitoBean
    private UserDetailsService userDetailsService;

    @Test
    @WithAnonymousUser
    void exigeAutenticacao() throws Exception {
        mvc.perform(get("/api/piso")).andExpect(status().isUnauthorized());
    }

    @Test
    void listaPisosPaginados() throws Exception {
        var piso = new Piso("L1", "Piso L1", 1);
        piso.setId("1");
        when(service.findAll(any(PageRequest.class))).thenReturn(new PageImpl<>(List.of(piso), PageRequest.of(0, 20), 1));

        mvc.perform(get("/api/piso"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].codigo").value("L1"))
                .andExpect(jsonPath("$.page.totalElements").value(1));
    }

    @Test
    void retorna404QuandoPisoNaoExiste() throws Exception {
        when(service.findById("x")).thenThrow(new EntityNotFoundException("Item não encontrado."));

        mvc.perform(get("/api/piso/x"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Item não encontrado."));
    }

    @Test
    @WithMockUser(roles = "FUNCIONARIO")
    void funcionarioConsultaMasNaoAlteraNemVeOMapa() throws Exception {
        when(service.findAll(any(PageRequest.class))).thenReturn(new PageImpl<>(List.of()));
        mvc.perform(get("/api/piso")).andExpect(status().isOk());
        mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post("/api/piso")
                        .contentType(org.springframework.http.MediaType.APPLICATION_JSON).content("{\"codigo\":\"L9\",\"nome\":\"Piso L9\",\"ordem\":9}"))
                .andExpect(status().isForbidden());
        mvc.perform(get("/api/piso/p2/mapa")).andExpect(status().isForbidden());
        mvc.perform(get("/api/piso/p2/marcadores")).andExpect(status().isForbidden());
        org.mockito.Mockito.verifyNoInteractions(plantaService, mapaService);
    }

    private static org.springframework.mock.web.MockMultipartFile parte(String nome, String arquivo, String tipo, byte[] conteudo) {
        return new org.springframework.mock.web.MockMultipartFile(nome, arquivo, tipo, conteudo);
    }

    @Test
    @WithMockUser(roles = "SUPERVISOR")
    void supervisorEnviaPlantaComPdfImagemEDados() throws Exception {
        when(plantaService.salvarPlanta(any(), any(), any(), any(), any()))
                .thenReturn(new com.smartmall.ops.domain.model.piso.PlantaResponse("planta.pdf", 1, 2400, 1600, null));

        mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart(org.springframework.http.HttpMethod.PUT, "/api/piso/p2/planta")
                        .file(parte("dados", "", "application/json", "{\"pagina\":1,\"largura\":2400,\"altura\":1600}".getBytes()))
                        .file(parte("pdf", "planta.pdf", "application/pdf", new byte[]{1}))
                        .file(parte("imagem", "planta.png", "image/png", new byte[]{2})))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.largura").value(2400));

        org.mockito.Mockito.verify(plantaService).salvarPlanta(org.mockito.ArgumentMatchers.eq("p2"), org.mockito.ArgumentMatchers.eq("planta.pdf"),
                any(), any(), any());
    }

    @Test
    @WithMockUser(roles = "SUPERVISOR")
    void plantaValidaTamanhoDaImagem() throws Exception {
        mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart(org.springframework.http.HttpMethod.PUT, "/api/piso/p2/planta")
                        .file(parte("dados", "", "application/json", "{\"pagina\":1,\"largura\":50,\"altura\":1600}".getBytes()))
                        .file(parte("pdf", "planta.pdf", "application/pdf", new byte[]{1}))
                        .file(parte("imagem", "planta.png", "image/png", new byte[]{2})))
                .andExpect(status().isBadRequest());
        org.mockito.Mockito.verifyNoInteractions(plantaService);
    }

    @Test
    @WithMockUser(roles = "ADMINISTRADOR")
    void baixaOPdfDaPlanta() throws Exception {
        when(plantaService.pdf("p2")).thenReturn(new com.smartmall.ops.domain.model.tarefa.ArquivoEvidencia("planta.pdf", "application/pdf", new byte[]{9}));

        mvc.perform(get("/api/piso/p2/planta/pdf"))
                .andExpect(status().isOk())
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.header().string("Content-Type", "application/pdf"))
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.header()
                        .string("Content-Disposition", org.hamcrest.Matchers.startsWith("attachment")));
    }

    @Test
    @WithMockUser(roles = "SUPERVISOR")
    void supervisorCriaLocalDeQrNoPiso() throws Exception {
        when(plantaService.criarLocal("p2", "Quiosque")).thenReturn(new com.smartmall.ops.domain.model.piso.MarcadoresResponse.Ponto("q1", "quiosque", "Quiosque", null, null));

        mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post("/api/piso/p2/locais")
                        .contentType(org.springframework.http.MediaType.APPLICATION_JSON).content("{\"nome\":\"Quiosque\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.codigo").value("quiosque"));
    }

    @Test
    @WithMockUser(roles = "FUNCIONARIO")
    void funcionarioNaoCriaLocal() throws Exception {
        mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post("/api/piso/p2/locais")
                        .contentType(org.springframework.http.MediaType.APPLICATION_JSON).content("{\"nome\":\"Quiosque\"}"))
                .andExpect(status().isForbidden());
        org.mockito.Mockito.verifyNoInteractions(plantaService);
    }
}
