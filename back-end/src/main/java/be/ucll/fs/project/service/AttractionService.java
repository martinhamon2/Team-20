package be.ucll.fs.project.service;

import be.ucll.fs.project.controller.dto.AttractionInput;
import be.ucll.fs.project.repository.AttractionRepository;
import be.ucll.fs.project.repository.ParkRepository;
import be.ucll.fs.project.repository.SparePartRepository;
import be.ucll.fs.project.unit.model.Attraction;
import be.ucll.fs.project.unit.model.Park;
import be.ucll.fs.project.unit.model.SparePart;
import be.ucll.fs.project.unit.model.Status;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AttractionService {

    private final AttractionRepository attractionRepository;
    private final SparePartRepository sparePartRepository;
    private final ParkRepository parkRepository;

    @Autowired
    public AttractionService(AttractionRepository attractionRepository, SparePartRepository sparePartRepository, ParkRepository parkRepository) {
        this.attractionRepository = attractionRepository;
        this.sparePartRepository = sparePartRepository;
        this.parkRepository = parkRepository;
    }

    public List<Attraction> getAttractions() {
        return attractionRepository.findAll();
    }

    public Attraction getAttractionById(Long attractionId) {
        return attractionRepository.findAttractionById(attractionId);
    }

    @Transactional
    public void addSparePartToAttraction(Long attractionId, Long sparePartId) {
        Attraction attraction = attractionRepository.findAttractionById(attractionId);
        SparePart sparePart = sparePartRepository.findSparePartById(sparePartId);

        if (attraction != null && sparePart != null) {
            attraction.getSpareParts().add(sparePart);
            sparePart.getAttractionList().add(attraction);
            attractionRepository.save(attraction);
        } else {
            throw new RuntimeException("Attraction or SparePart not found");
        }
    }

    @Transactional
    public void removeSparePartFromAttraction(Long attractionId, Long sparePartId) {
        Attraction attraction = attractionRepository.findAttractionById(attractionId);
        SparePart sparePart = sparePartRepository.findSparePartById(sparePartId);

        if (attraction != null && sparePart != null) {
            attraction.getSpareParts().remove(sparePart);
            sparePart.getAttractionList().remove(attraction);
            attractionRepository.save(attraction);
        } else {
            throw new RuntimeException("Attraction or SparePart not found");
        }
    }

    @Transactional
    public Attraction changeAttractionStatus(Long attractionId) {
        Attraction attraction = attractionRepository.findAttractionById(attractionId);

        if (attraction == null) {
            throw new RuntimeException("Attraction not found");
        }

        attraction.rotateStatus();

        return attractionRepository.save(attraction);
    }


    @Transactional
    public Attraction createAttraction(AttractionInput input) {
        Park park = parkRepository.findById(input.parkId())
                .orElseThrow(() -> new RuntimeException("Park not found with ID: " + input.parkId()));

        Attraction attraction = new Attraction(
                input.type(),
                input.name(),
                input.waitTime(),
                input.accessibility(),
                input.minAge(),
                input.minHeight()
        );
        attraction.setPark(park);
        attraction.setStatus(Status.UP);

        if (input.sparePartIds() != null && !input.sparePartIds().isEmpty()) {
            List<SparePart> parts = sparePartRepository.findAllById(input.sparePartIds());

            if (parts.size() != input.sparePartIds().size()) {
                throw new RuntimeException("One or more SparePart IDs were invalid.");
            }
            attraction.setSpareParts(parts);
            for (SparePart part : parts) {
                part.getAttractionList().add(attraction);

            }
        }

        return attractionRepository.save(attraction);
    }

    @Transactional
    public Attraction updateAttractionDetails(Long id, AttractionInput input) {
        Attraction attraction = attractionRepository.findAttractionById(id);
        if (attraction == null) {
            throw new RuntimeException("Attraction not found");
        }

        if (input.parkId() != null && !input.parkId().equals(attraction.getPark().getId())) {
            Park park = parkRepository.findById(input.parkId())
                    .orElseThrow(() -> new RuntimeException("Park not found"));
            attraction.setPark(park);
        }

        if (input.type() != null && !input.type().isBlank()) {
            attraction.setType(input.type());
        }

        if (attraction.getStatus() == Status.UP) {
            attraction.setWaitTime(input.waitTime());
        } else {
            attraction.setWaitTime(null);
        }

        return attractionRepository.save(attraction);
    }
}