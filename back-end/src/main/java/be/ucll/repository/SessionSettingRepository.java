package be.ucll.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import be.ucll.model.SessionSetting;

@Repository
public interface SessionSettingRepository extends JpaRepository<SessionSetting, Long> {

    SessionSetting findBySessionId(String id);

}
