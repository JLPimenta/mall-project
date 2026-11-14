package com.smartmall.ops.domain.service.piso;

import com.smartmall.ops.domain.core.exception.DomainException;
import com.smartmall.ops.domain.core.service.BaseService;
import com.smartmall.ops.domain.entity.Piso;
import com.smartmall.ops.domain.repository.chamado.LocalQrRepository;
import com.smartmall.ops.domain.repository.equipamento.EquipamentoRepository;
import com.smartmall.ops.domain.repository.piso.PisoRepository;
import com.smartmall.ops.domain.repository.piso.PlantaPisoRepository;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Service;

@Service
public class PisoService extends BaseService<Piso> implements IPisoService {

    private final EquipamentoRepository equipamentoRepository;
    private final LocalQrRepository localRepository;
    private final PlantaPisoRepository plantaRepository;

    protected PisoService(final PisoRepository repository, final EquipamentoRepository equipamentoRepository,
                          final LocalQrRepository localRepository, final PlantaPisoRepository plantaRepository) {
        super(repository);
        this.equipamentoRepository = equipamentoRepository;
        this.localRepository = localRepository;
        this.plantaRepository = plantaRepository;
    }

    /** Piso em uso não sai; a planta sai junto (os marcadores caem por ON DELETE CASCADE). */
    @Override
    @Transactional
    public void delete(String id) {
        if (equipamentoRepository.existsByPisoId(id)) {
            throw new DomainException("Piso com equipamentos não pode ser excluído.");
        }
        if (localRepository.existsByPisoId(id)) {
            throw new DomainException("Piso com locais de QR Code não pode ser excluído.");
        }
        plantaRepository.findByPisoId(id).ifPresent(plantaRepository::delete);
        plantaRepository.flush();
        super.delete(id);
    }

    @Override
    public void validate(Piso piso) throws DomainException {
        if (getRepository().existeCodigo(piso.getCodigo(), piso.getId())) {
            throw new DomainException("Já existe um piso com o código %s.", piso.getCodigo());
        }
    }

    @Override
    public PisoRepository getRepository() {
        return (PisoRepository) super.getRepository();
    }
}
