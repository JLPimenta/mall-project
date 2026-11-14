package com.smartmall.ops.domain.repository.piso;

import com.smartmall.ops.domain.core.repository.BaseRepository;
import com.smartmall.ops.domain.entity.Piso;
import org.springframework.stereotype.Repository;

@Repository
public interface PisoRepository extends BaseRepository<Piso> {
    boolean existsByCodigoIgnoreCase(String codigo);
}
