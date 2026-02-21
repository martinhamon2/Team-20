package be.ucll.fs.project.repository;

import be.ucll.fs.project.unit.model.SparePart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SparePartRepository extends JpaRepository<SparePart, Long> {

    SparePart findById(long id);

    SparePart findSparePartById(Long id);

}
