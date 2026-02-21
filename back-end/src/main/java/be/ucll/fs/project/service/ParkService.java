package be.ucll.fs.project.service;

import be.ucll.fs.project.repository.ParkRepository;
import be.ucll.fs.project.unit.model.Park;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ParkService {

    private final ParkRepository parkRepository;

    @Autowired
    public ParkService(ParkRepository parkRepository) {
        this.parkRepository = parkRepository;
    }

    public List<Park> getAllParks() {
        return parkRepository.findAll();
    }
}
