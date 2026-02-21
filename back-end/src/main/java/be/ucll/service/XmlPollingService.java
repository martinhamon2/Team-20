package be.ucll.service;

import be.ucll.model.*;
import be.ucll.repository.EventSettingRepository;
import be.ucll.repository.SessionSettingRepository;
import be.ucll.repository.RegistrationRepository;

import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class XmlPollingService {
    private final XmlParserService xmlParserService;
    private final EventSettingSyncService eventSettingSyncService;
    private final RegistrationRepository registrationRepository;

    private final EventSettingRepository eventSettingRepository;
    private final SessionSettingRepository sessionSettingRepository;

    public XmlPollingService(
            XmlParserService xmlParserService,
            EventSettingSyncService eventSettingSyncService,
            RegistrationRepository registrationRepository,
            EventSettingRepository eventSettingRepository,
            SessionSettingRepository sessionSettingRepository) {

        this.xmlParserService = xmlParserService;
        this.eventSettingSyncService = eventSettingSyncService;
        this.registrationRepository = registrationRepository;
        this.eventSettingRepository = eventSettingRepository;
        this.sessionSettingRepository = sessionSettingRepository;
    }

    public List<Event> pollAllXmlEvents() throws Exception {
        List<Event> events = xmlParserService.parseAllEvents();

        // Add DB settings for event + session
        attachSettings(events);

        // Sync settings (your existing logic)
        eventSettingSyncService.syncEventAndSessionSettings(events);

        // Add registrations
        enrichWithRegistrations(events);

        return events;
    }

    private void attachSettings(List<Event> events) {
        for (Event event : events) {

            // --- EVENT SETTING ---
            EventSetting dbEventSetting = eventSettingRepository.findByEventId(event.getId());
            if (dbEventSetting != null) {
                event.setEventSetting(dbEventSetting);
            } else {
                EventSetting newSetting = event.getEventSetting();
                if (newSetting == null)
                    newSetting = new EventSetting(event.getId());
                newSetting.setEventId(event.getId());
                event.setEventSetting(eventSettingRepository.save(newSetting));
            }

            // --- SESSION SETTINGS ---
            for (Session session : event.getSessions()) {
                SessionSetting dbSessionSetting = sessionSettingRepository.findBySessionId(session.getId());

                if (dbSessionSetting != null) {
                    session.setSessionSetting(dbSessionSetting);
                } else {
                    SessionSetting newSessionSetting = session.getSessionSetting();
                    newSessionSetting.setSessionId(session.getId());
                    session.setSessionSetting(sessionSettingRepository.save(newSessionSetting));
                }
            }
        }
    }

    private void enrichWithRegistrations(List<Event> events) {
        List<Registration> allRegistrations = registrationRepository.findAll();

        Map<String, List<Registration>> regsBySessionId = allRegistrations.stream()
                .flatMap(reg -> reg.getSessionIds().stream()
                        .map(sessionId -> Map.entry(sessionId, reg)))
                .collect(Collectors.groupingBy(
                        Map.Entry::getKey,
                        Collectors.mapping(Map.Entry::getValue, Collectors.toList())));

        for (Event event : events) {
            for (Session session : event.getSessions()) {

                session.getRegistrations().clear();

                List<Registration> regs = regsBySessionId.get(session.getId());
                if (regs != null) {
                    regs.forEach(session::addRegistration);
                }
            }
        }
    }
}
