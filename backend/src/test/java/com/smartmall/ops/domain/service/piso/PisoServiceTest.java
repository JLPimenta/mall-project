package com.smartmall.ops.domain.service.piso;

import com.smartmall.ops.domain.core.exception.DomainException;
import com.smartmall.ops.domain.entity.Piso;
import com.smartmall.ops.domain.repository.piso.PisoRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PisoServiceTest {

    @Mock
    private PisoRepository repository;

    @Mock
    private com.smartmall.ops.domain.repository.equipamento.EquipamentoRepository equipamentoRepository;

    @Mock
    private com.smartmall.ops.domain.repository.chamado.LocalQrRepository localRepository;

    @Mock
    private com.smartmall.ops.domain.repository.piso.PlantaPisoRepository plantaRepository;

    @InjectMocks
    private PisoService service;

    @Test
    void criaPisoComCodigoNovo() {
        var piso = new Piso("L3", "Piso L3", 3);
        when(repository.existeCodigo("L3", null)).thenReturn(false);
        when(repository.save(any())).thenReturn(piso);

        service.create(piso);

        verify(repository).save(piso);
    }

    @Test
    void rejeitaCodigoDuplicado() {
        var piso = new Piso("L1", "Piso L1", 1);
        when(repository.existeCodigo("L1", null)).thenReturn(true);

        assertThatThrownBy(() -> service.create(piso))
                .isInstanceOf(DomainException.class)
                .hasMessage("Já existe um piso com o código L1.");
    }

    @Test
    void naoExcluiPisoEmUso() {
        when(equipamentoRepository.existsByPisoId("p1")).thenReturn(true);
        assertThatThrownBy(() -> service.delete("p1")).hasMessage("Piso com equipamentos não pode ser excluído.");

        when(equipamentoRepository.existsByPisoId("p1")).thenReturn(false);
        when(localRepository.existsByPisoId("p1")).thenReturn(true);
        assertThatThrownBy(() -> service.delete("p1")).hasMessage("Piso com locais de QR Code não pode ser excluído.");
        org.mockito.Mockito.verify(repository, org.mockito.Mockito.never()).deleteById(any());
    }

    @Test
    void excluiPisoSemUsoJuntoComAPlanta() {
        var planta = new com.smartmall.ops.domain.entity.PlantaPiso();
        when(plantaRepository.findByPisoId("p1")).thenReturn(java.util.Optional.of(planta));

        service.delete("p1");

        verify(plantaRepository).delete(planta);
        verify(repository).deleteById("p1");
    }
}
