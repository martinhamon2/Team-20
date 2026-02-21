package be.ucll.service;

import be.ucll.controller.dto.EmailTemplateDTO;
import be.ucll.controller.dto.EventSettingDTO;
import be.ucll.exception.EventException;
import be.ucll.model.*;
import be.ucll.repository.EmailTemplateRepository;
import be.ucll.repository.EventSettingRepository;
import be.ucll.repository.SessionSettingRepository;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class EventService {
    private final XmlPollingService xmlPollingService;
    private final EventSettingRepository eventSettingRepository;
    private final SessionSettingRepository sessionSettingRepository;
    private final EmailTemplateRepository emailTemplateRepository;

    public EventService(
            XmlPollingService xmlPollingService,
            EventSettingRepository eventSettingRepository,
            SessionSettingRepository sessionSettingRepository,
            EmailTemplateRepository emailTemplateRepository) {
        this.xmlPollingService = xmlPollingService;
        this.eventSettingRepository = eventSettingRepository;
        this.sessionSettingRepository = sessionSettingRepository;
        this.emailTemplateRepository = emailTemplateRepository;
    }

    public List<Event> getEvents(Authentication authentication) throws Exception {
        List<Event> allEvents = xmlPollingService.pollAllXmlEvents();

        if (authentication == null || !authentication.isAuthenticated()) {
            LocalDate today = LocalDate.now();
            return allEvents.stream()
                    .filter(e -> e.getEventSetting().getActive())
                    .filter(e -> !e.getBeginDate().isAfter(today))
                    .toList();
        }

        return allEvents;
    }

    public EventSetting changeEventStatus(String eventId) throws Exception {
        Event event = getById(eventId, true);

        EventSetting eventSetting = event.getEventSetting();
        if (eventSetting == null) {
            throw new EventException("Event setting not found");
        }

        boolean newActiveStatus = !eventSetting.getActive();
        eventSetting.setActive(newActiveStatus);

        EventSetting savedEventSetting = eventSettingRepository.save(eventSetting);

        for (Session session : event.getSessions()) {
            SessionSetting sessionSetting = session.getSessionSetting();
            if (sessionSetting != null) {
                sessionSetting.setActive(newActiveStatus);
                sessionSettingRepository.save(sessionSetting);
            }
        }

        return savedEventSetting;
    }

    public Event getById(String eventId, boolean changeStatus) throws Exception {
        Optional<Event> optionalEvent = xmlPollingService.pollAllXmlEvents().stream()
                .filter(e -> e.getId().equals(eventId))
                .findFirst();

        Event event = optionalEvent.orElseThrow(() -> new EventException("Event not found"));

        if (!changeStatus) {
            if (!event.getEventSetting().getActive()) {
                throw new EventException("Event not active");
            }

            LocalDate today = LocalDate.now();
            if (event.getBeginDate().isAfter(today)) {
                throw new EventException("Event has not started yet");
            }

            if (event.getEndDate().isBefore(today)) {
                throw new EventException("Event has already ended");
            }
        }

        // Filter only active sessions
        if (event.getSessions() != null) {
            event.setSessions(event.getSessions().stream()
                    .filter(session -> session.getSessionSetting() != null && session.getSessionSetting().getActive())
                    .toList());
        }

        return event;
    }

    public EventSetting updateEventSetting(String eventId, EventSettingDTO eventSettingDTO) throws Exception {
        EventSetting eventSetting = eventSettingRepository.findByEventId(eventId);

        if (eventSetting == null) {
            throw new EventException("Event not found");
        }

        eventSetting.setSortOrder(eventSettingDTO.sortOrder());
        eventSetting.setSortField(eventSettingDTO.sortField());
        eventSetting.setMoveFullToBack(eventSettingDTO.moveFullToBack());
        eventSetting.setMovePastToBack(eventSettingDTO.movePastToBack());
        eventSetting.setValidateOverlapping(eventSettingDTO.validateOverlapping());
        eventSetting.setPhoneFormat(eventSettingDTO.phoneFormat());
        eventSetting.setCanUnsubscribe(eventSettingDTO.canUnsubscribe());
        eventSetting.setTemplateName(eventSettingDTO.templateName());
        eventSetting.setPrimaryColor(eventSettingDTO.primaryColor());
        eventSetting.setSecondaryColor(eventSettingDTO.secondaryColor());

        return eventSettingRepository.save(eventSetting);
    }

    public Event getEventBySessionId(String sessionId) throws Exception {
        Optional<Event> optionalEvent = xmlPollingService.pollAllXmlEvents().stream()
                .filter(e -> e.getSessions().stream().anyMatch(s -> s.getId().equals(sessionId))).findFirst();

        return optionalEvent.orElseThrow(() -> new EventException("Event not found"));
    }

    public EmailTemplate createEmailTemplate(EmailTemplateDTO emailTemplateDTO, String eventId) {
        EmailTemplate emailTemplate = new EmailTemplate(emailTemplateDTO.templateName(), emailTemplateDTO.content(),
                emailTemplateDTO.subject());

        EventSetting eventSetting = eventSettingRepository.findByEventId(eventId);

        if (eventSetting == null) {
            throw new EventException("Event not found");
        }

        eventSetting.setTemplateName(emailTemplate.getTemplateName());
        EmailTemplate emailTemplateSaved = emailTemplateRepository.save(emailTemplate);
        eventSettingRepository.save(eventSetting);

        return emailTemplateSaved;
    }

    public List<EmailTemplate> getAllEmailTemplates() {
        return emailTemplateRepository.findAll();
    }

    public Event getEventById(String eventId) throws Exception {
        Optional<Event> optionalEvent = xmlPollingService.pollAllXmlEvents().stream()
                .filter(e -> e.getId().equals(eventId))
                .findFirst();

        return optionalEvent.orElseThrow(() -> new EventException("Event not found"));
    }
}
