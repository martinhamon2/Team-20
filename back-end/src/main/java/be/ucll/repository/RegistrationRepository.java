package be.ucll.repository;

import be.ucll.model.Registration;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RegistrationRepository extends JpaRepository<Registration, Long> {

    Registration findRegistrationById(Long id);

    List<Registration> findBySessionIdsContaining(String sessionId);

    List<Registration> findRegistrationsByEmail(String email);

    Optional<Registration> findByEmailAndSessionIdsContaining(String email, String sessionId);
    List<Registration> findByEmail(String email);

    List<Registration> findBySessionIdsIn(List<String> sessionIds);

}
