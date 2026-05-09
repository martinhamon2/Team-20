package be.ucll.fs.project.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import be.ucll.fs.project.unit.model.TwoFactorAuthCode;

public interface TwoFactorAuthCodeRepository extends JpaRepository<TwoFactorAuthCode, Long> {
    Optional<TwoFactorAuthCode> findByUsername(String username);
    void deleteByUsername(String username);
}