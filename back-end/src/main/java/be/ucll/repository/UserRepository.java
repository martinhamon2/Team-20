package be.ucll.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import be.ucll.model.User;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    boolean existsByUsername(String username);

    Optional<User> findByUsername(String username);
}
