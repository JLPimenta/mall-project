package com.smartmall.ops.domain.repository.piso;

import com.smartmall.ops.domain.core.repository.BaseRepository;
import com.smartmall.ops.domain.entity.MarcadorPiso;
import com.smartmall.ops.domain.entity.enums.TipoMarcador;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MarcadorPisoRepository extends BaseRepository<MarcadorPiso> {

    List<MarcadorPiso> findByPisoId(String pisoId);

    @Modifying
    @Query("delete from MarcadorPiso m where m.piso.id = :pisoId")
    void excluirDoPiso(String pisoId);

    @Modifying
    @Query("delete from MarcadorPiso m where m.tipo = :tipo and m.referenciaId = :referenciaId")
    void excluirDaReferencia(TipoMarcador tipo, String referenciaId);
}
