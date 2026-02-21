package be.ucll.fs.project.repository;

import be.ucll.fs.project.unit.model.Park;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ParkRepository extends JpaRepository<Park, Long> {
}
