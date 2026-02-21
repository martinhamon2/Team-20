package be.ucll.fs.project.service;

import be.ucll.fs.project.repository.SparePartRepository;
import be.ucll.fs.project.unit.model.SparePart;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SparePartService {

    private final SparePartRepository sparePartRepository;

    @Autowired
    public SparePartService(SparePartRepository sparePartRepository) {
        this.sparePartRepository = sparePartRepository;
    }

    public List<SparePart> getAllSpareParts() {
        return sparePartRepository.findAll();
    }

    public SparePart getSparePartById(Long sparePartId) {
        return sparePartRepository.findSparePartById(sparePartId);
    }
}
