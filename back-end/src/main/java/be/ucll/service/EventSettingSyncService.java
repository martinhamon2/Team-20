package be.ucll.service;

import org.springframework.stereotype.Service;
import be.ucll.model.*;
import be.ucll.repository.*;

import java.util.List;

@Service
public class EventSettingSyncService {
    private final EventSettingRepository eventSettingRepository;
    private final SessionSettingRepository sessionSettingRepository;

    public EventSettingSyncService(EventSettingRepository eventSettingRepository,
            SessionSettingRepository sessionSettingRepository) {
        this.eventSettingRepository = eventSettingRepository;
        this.sessionSettingRepository = sessionSettingRepository;
    }

    public void syncEventAndSessionSettings(List<Event> events) {
        for (Event event : events) {
            EventSetting existingEventSetting = eventSettingRepository.findByEventId(event.getId());
            if (existingEventSetting == null) {
                EventSetting newSetting = event.getEventSetting();
                newSetting.setEventId(event.getId());
                event.setEventSetting(eventSettingRepository.save(newSetting));
            } else {
                event.setEventSetting(existingEventSetting);
            }

            for (Session session : event.getSessions()) {
                SessionSetting existingSessionSetting = sessionSettingRepository.findBySessionId(session.getId());
                if (existingSessionSetting == null) {
                    SessionSetting newSetting = session.getSessionSetting();
                    newSetting.setSessionId(session.getId());
                    session.setSessionSetting(sessionSettingRepository.save(newSetting));
                } else {
                    session.setSessionSetting(existingSessionSetting);
                }
            }
        }
    }
}