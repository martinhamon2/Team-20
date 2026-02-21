package be.ucll.controller;

import be.ucll.controller.dto.EmailTemplateDTO;
import be.ucll.controller.dto.EventSettingDTO;
import be.ucll.model.EmailTemplate;
import be.ucll.model.Event;
import be.ucll.model.EventSetting;
import be.ucll.service.EmailService;
import be.ucll.service.EventService;
import be.ucll.service.RegistrationService;
import jakarta.validation.Valid;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/events")
public class EventController {
    private final EventService eventService;
    private final EmailService emailService;
    private final RegistrationService registrationService;

    public EventController(EventService eventService, EmailService emailService, RegistrationService registrationService) {
        this.emailService = emailService;
        this.eventService = eventService;
        this.registrationService = registrationService;
    }

    @GetMapping
    public List<Event> getEvents(Authentication authentication) throws Exception {
        return eventService.getEvents(authentication);
    }

    @GetMapping("/{eventId}")
    public Event getEventById(@Valid @PathVariable String eventId) throws Exception {
        return eventService.getById(eventId, true);
    }

    @GetMapping("/session/{sessionId}")
    public Event getEventBySessionId(@Valid @PathVariable String sessionId) throws Exception {
        return eventService.getEventBySessionId(sessionId);
    }

    @PutMapping("/{eventId}")
    public EventSetting changeEventStatus(@Valid @PathVariable String eventId) throws Exception {
        return eventService.changeEventStatus(eventId);
    }

    @PutMapping("/{eventId}/settings")
    public EventSetting updateSettings(@PathVariable String eventId, @RequestBody EventSettingDTO eventSettingDTO)
            throws Exception {
        return eventService.updateEventSetting(eventId, eventSettingDTO);
    }

    @PostMapping("/emailTemplate/{eventId}")
    public EmailTemplate createEmailTemplate(@RequestBody EmailTemplateDTO emailTemplateDTO,
            @PathVariable String eventId) {
        return eventService.createEmailTemplate(emailTemplateDTO, eventId);
    }

    @GetMapping("/templates")
    public List<EmailTemplate> getAllEmailTemplates() {
        return eventService.getAllEmailTemplates();
    }

    @GetMapping(value = "/download/{eventId}")
    public ResponseEntity<byte[]> downloadRegistrationsXml(@PathVariable String eventId) throws Exception {
        byte[] xmlData = registrationService.getRegistrationByEventId(eventId);

        HttpHeaders headers = new HttpHeaders();

        headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=registrations_" + eventId + ".xml");

        headers.add(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_XML_VALUE);

        return ResponseEntity.ok()
                .headers(headers)
                .body(xmlData);
    }
}
