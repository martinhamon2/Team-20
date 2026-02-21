package be.ucll.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import be.ucll.model.EventSetting;

public interface EventSettingRepository extends JpaRepository<EventSetting, Long> {

    EventSetting findByEventId(String eventId);

}
