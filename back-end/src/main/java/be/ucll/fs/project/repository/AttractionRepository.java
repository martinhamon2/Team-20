package be.ucll.fs.project.repository;

import be.ucll.fs.project.unit.model.Attraction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AttractionRepository extends JpaRepository<Attraction, Long> {

    Attraction findAttractionById(Long id);
}
