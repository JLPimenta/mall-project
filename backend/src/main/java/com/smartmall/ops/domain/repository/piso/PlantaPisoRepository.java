package com.smartmall.ops.domain.repository.piso;

import com.smartmall.ops.domain.core.repository.BaseRepository;
import com.smartmall.ops.domain.entity.PlantaPiso;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PlantaPisoRepository extends BaseRepository<PlantaPiso> {

    Optional<PlantaPiso> findByPisoId(String pisoId);
}
