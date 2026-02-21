package be.ucll.service;

import java.nio.charset.StandardCharsets;
import java.io.ByteArrayOutputStream;
import java.util.List;
import java.util.Map;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Objects;
import java.util.stream.Collectors;

import be.ucll.controller.dto.*;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.dataformat.xml.XmlMapper;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import org.hibernate.service.spi.ServiceException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;

import be.ucll.exception.RegistrationException;
import be.ucll.model.Event;
import be.ucll.model.Registration;
import be.ucll.model.Session;
import be.ucll.repository.RegistrationRepository;

@Service
public class RegistrationService {

    private final EventService eventService;
    @Value("${app.base-url}")
    private String baseUrl;

    private final RegistrationRepository registrationRepository;
    private final EmailService emailService;
    private final JwtService jwtService;
    private final Environment environment;
    private final XmlPollingService xmlPollingService;

    public RegistrationService(
            RegistrationRepository registrationRepository,
            EmailService emailService,
            JwtService jwtService,
            Environment environment,
            XmlPollingService xmlPollingService, EventService eventService) {
        this.registrationRepository = registrationRepository;
        this.emailService = emailService;
        this.jwtService = jwtService;
        this.environment = environment;
        this.xmlPollingService = xmlPollingService;
        this.eventService = eventService;
    }

    private String getBaseUrl() {
        if (List.of(environment.getActiveProfiles()).contains("prod")) {
            return "https://front-end-team18-wpp-team-18.apps.okd.ucll.cloud";
        }
        return baseUrl != null && !baseUrl.isBlank() ? baseUrl : null;
    }

    public byte[] generateQrCode(String token) throws Exception {
        QRCodeWriter qrCodeWriter = new QRCodeWriter();
        BitMatrix bitMatrix = qrCodeWriter.encode(token, BarcodeFormat.QR_CODE, 500, 500);

        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        MatrixToImageWriter.writeToStream(bitMatrix, "PNG", outputStream);

        return outputStream.toByteArray();
    }

    public String registrateUserToSession(RegistrationInput registrationInput) throws Exception {
        if (registrationInput.sessionIds() == null || registrationInput.sessionIds().isEmpty()) {
            throw new RegistrationException("No session IDs provided");
        }

        List<Event> allEvents = xmlPollingService.pollAllXmlEvents();
        List<Session> allSessions = getAllSessions(allEvents);

        Registration registration = buildRegistration(registrationInput);

        List<Registration> existingRegistrations = registrationRepository
                .findRegistrationsByEmail(registrationInput.email());

        Event eventForSession = null;
        for (String sessionId : registrationInput.sessionIds()) {
            Session session = findSessionById(allSessions, sessionId);

            validateSessionCapacity(session, sessionId);

            eventForSession = findEventForSession(allEvents, sessionId);

            validateEventSpecificFields(eventForSession, registration);

            if (eventForSession.getEventSetting().isValidateOverlapping()) {
                validateNoOverlapWithExisting(existingRegistrations, allSessions, session, sessionId);
                validateNoOverlapWithinInput(registrationInput, allSessions, session, sessionId);
            }

            if (session.getId() == null) {
                throw new ServiceException("session id is empty");
            }

            registration.addSessionId(session.getId());
        }

        registrationRepository.save(registration);

        List<Session> registeredSessions = getRegisteredSessions(registration, allSessions);

        String cancellationToken = jwtService.generateRegistrationToken(registration.getEmail(), registration.getId());
        String cancellationLink = getBaseUrl() + "/events/cancel/" + cancellationToken;

        emailService.sendEmail(
                registration.getEmail(),
                "ICTS Registration Confirmation",
                eventForSession.getEventSetting().getTemplateName(),
                buildConfirmationEmailMap(registration, registeredSessions, cancellationLink),
                registration.getId(),
                generateQrCode(jwtService.generateEmailToken(registrationInput.email())));

        return "Successfully registered to sessions: " + String.join(", ", registration.getSessionIds());
    }

    private void validateEventSpecificFields(Event event, Registration registration) {
        if (event == null)
            return;

        String description = event.getDescription() != null ? event.getDescription().toLowerCase() : "";

        if (description.contains("openlesdagen")) {
            if (registration.getSchool() == null || registration.getSchool().isBlank()) {
                throw new RegistrationException("School is required for Openlesdagen events.");
            }
            if (registration.getStartYear() == null) {
                throw new RegistrationException("Start year is required for Openlesdagen events.");
            }
        }
        // Verderstudeerbeurs logic is implicit (fields are optional)
    }

    public String cancelSession(String token, String sessionId) {
        var jwt = jwtService.decodeToken(token);
        String email = jwt.getSubject();

        String type = jwt.getClaim("type");
        if (!type.equals("registration")) {
            throw new RegistrationException("Invalid token type for cancellation");
        }

        List<Registration> registrations = registrationRepository.findBySessionIdsContaining(sessionId);
        if (registrations.isEmpty()) {
            throw new RegistrationException("No registration found containing session " + sessionId);
        }

        Registration registration = registrations.stream()
                .filter(r -> r.getEmail().equals(email))
                .findFirst()
                .orElseThrow(() -> new RegistrationException(
                        "Registration for email " + email + " containing session " + sessionId + " not found"));

        if (!registration.getSessionIds().remove(sessionId)) {
            throw new RegistrationException("Session ID " + sessionId + " not found in registration");
        }

        String message;
        if (registration.getSessionIds().isEmpty()) {
            registrationRepository.delete(registration);
            message = "All sessions removed. Registration deleted successfully.";
        } else {
            registrationRepository.save(registration);
            message = "Session " + sessionId + " removed from your registration successfully.";
        }

        emailService.cancelMail(
                registration.getEmail(),
                "ICTS Session Cancellation",
                "cancellation-confirmation",
                buildCancelEmailMap(registration, sessionId));

        return message;
    }

    public List<Registration> getAllRegistrations() {
        return registrationRepository.findAll();
    }

    public List<SessionDTO> findRegistrationsByEmail(String email) throws Exception {
        List<Registration> registrations = registrationRepository.findByEmail(email);

        List<Event> events = xmlPollingService.pollAllXmlEvents();
        Map<String, Session> sessionMap = events.stream()
                .flatMap(e -> e.getSessions().stream())
                .collect(Collectors.toMap(Session::getId, s -> s, (a, b) -> a));

        return registrations.stream()
                .flatMap(reg -> reg.getSessionIds().stream())
                .distinct()
                .map(sessionMap::get)
                .filter(Objects::nonNull)
                .map(s -> new SessionDTO(
                        s.getId(),
                        s.getDescription(),
                        s.getType(),
                        s.getCategory(),
                        s.getBeginDate(),
                        s.getEndDate(),
                        s.getBeginTime(),
                        s.getEndTime(),
                        s.getLocation(),
                        s.getMapUrl(),
                        s.getMaxCapacity(),
                        s.getRegistrations()))
                .toList();
    }

    private Registration buildRegistration(RegistrationInput input) {
        return new Registration(
                input.firstName(),
                input.lastName(),
                input.address(),
                input.county(),
                input.postcode(),
                input.phoneNumber(),
                input.email(),
                input.school(),
                input.correspondenceLanguage(),
                input.startYear(),
                input.dateOfBirth());
    }

    private List<Session> getAllSessions(List<Event> events) {
        return events.stream()
                .flatMap(event -> event.getSessions().stream())
                .toList();
    }

    private Session findSessionById(List<Session> allSessions, String sessionId) {
        return allSessions.stream()
                .filter(s -> s.getId().equals(sessionId))
                .findFirst()
                .orElseThrow(() -> new RegistrationException("Session with ID " + sessionId + " not found"));
    }

    private Event findEventForSession(List<Event> events, String sessionId) {
        return events.stream()
                .filter(e -> e.getSessions().stream().anyMatch(s -> s.getId().equals(sessionId)))
                .findFirst()
                .orElseThrow(() -> new RegistrationException("Event for session " + sessionId + " not found"));
    }

    private void validateSessionCapacity(Session session, String sessionId) {
        if (session.getMaxCapacity() > 0 && session.getRegistrations().size() >= session.getMaxCapacity()) {
            throw new RegistrationException("Session " + sessionId + " is full");
        }
    }

    private void validateNoOverlapWithExisting(List<Registration> existingRegistrations, List<Session> allSessions,
            Session session, String sessionId) {
        for (Registration existingReg : existingRegistrations) {
            for (String existingSessionId : existingReg.getSessionIds()) {
                Session existingSession = findSessionById(allSessions, existingSessionId);
                if (session.overlapsWith(existingSession)) {
                    throw new RegistrationException("Session " + sessionId
                            + " overlaps with already registered session " + existingSession.getId());
                }
            }
        }
    }

    private void validateNoOverlapWithinInput(RegistrationInput registrationInput, List<Session> allSessions,
            Session session, String sessionId) {
        for (String otherSessionId : registrationInput.sessionIds()) {
            if (otherSessionId.equals(sessionId))
                continue;
            Session otherSession = findSessionById(allSessions, otherSessionId);
            if (session.overlapsWith(otherSession)) {
                throw new RegistrationException(
                        "Session " + sessionId + " overlaps with another selected session " + otherSession.getId());
            }
        }
    }

    private List<Session> getRegisteredSessions(Registration registration, List<Session> allSessions) {
        return registration.getSessionIds().stream()
                .map(id -> allSessions.stream()
                        .filter(s -> s.getId().equals(id))
                        .findFirst()
                        .orElse(null))
                .filter(Objects::nonNull)
                .toList();
    }

    private Map<String, Object> buildConfirmationEmailMap(Registration registration, List<Session> registeredSessions,
            String cancellationLink) {
        Map<String, Object> map = new HashMap<>();
        map.put("firstName", registration.getFirstName());
        map.put("lastName", registration.getLastName());
        map.put("address", registration.getAddress());
        map.put("county", registration.getCounty());
        map.put("postcode", registration.getPostcode());
        map.put("phoneNumber", registration.getPhoneNumber());
        map.put("email", registration.getEmail());
        map.put("school", registration.getSchool());
        map.put("sessions", registeredSessions);
        map.put("cancellationLink", cancellationLink);
        map.put("correspondenceLanguage", registration.getCorrespondenceLanguage());
        map.put("startYear", registration.getStartYear());
        map.put("dateOfBirth", registration.getDateOfBirth());
        map.put("isPresent", registration.getIsPresent());

        map.put("sessions", registeredSessions);
        map.put("cancellationLink", cancellationLink);
        return map;
    }

    private Map<String, Object> buildCancelEmailMap(Registration registration, String sessionId) {
        Map<String, Object> map = new HashMap<>();
        map.put("firstName", registration.getFirstName());
        map.put("sessionId", sessionId);
        return map;
    }

    public String precheck(String email, List<String> sessionIds) throws Exception {
        List<Registration> existingRegistrations = registrationRepository.findByEmail(email);

        if (existingRegistrations.isEmpty()) {
            return "No conflicts found";
        }

        List<Event> allEvents = xmlPollingService.pollAllXmlEvents();
        List<Session> allSessions = getAllSessions(allEvents);
        List<Session> conflictingSessions = new ArrayList<>();

        for (Registration registration : existingRegistrations) {
            for (String existingSessionId : registration.getSessionIds()) {
                Session existingSession = findSessionById(allSessions, existingSessionId);

                for (String inputSessionId : sessionIds) {
                    Session inputSession = findSessionById(allSessions, inputSessionId);

                    if (existingSession.overlapsWith(inputSession)) {
                        if (!conflictingSessions.stream().anyMatch(s -> s.getId().equals(existingSession.getId()))) {
                            conflictingSessions.add(existingSession);
                        }
                        if (!conflictingSessions.stream().anyMatch(s -> s.getId().equals(inputSession.getId()))) {
                            conflictingSessions.add(inputSession);
                        }
                    }
                }
            }
        }

        if (!conflictingSessions.isEmpty()) {
            throw new RegistrationException("Conflicts");
        }

        return "No conflicts found";
    }

    public Registration updateRegistrationField(Long id, String fieldName, String value) {
        Registration registration = registrationRepository.findById(id)
                .orElseThrow(() -> new RegistrationException("Registration with ID " + id + " not found"));

        String cleanValue = value != null ? value.trim() : "";

        switch (fieldName) {
            case "firstName" -> registration.setFirstName(cleanValue);
            case "lastName" -> registration.setLastName(cleanValue);
            case "email" -> registration.setEmail(cleanValue);
            case "phoneNumber" -> registration.setPhoneNumber(cleanValue);
            case "school" -> registration.setSchool(cleanValue);
            case "address" -> registration.setAddress(cleanValue);
            case "county" -> registration.setCounty(cleanValue);
            case "dateOfBirth" -> registration.setDateOfBirth(cleanValue);
            case "correspondenceLanguage" -> registration.setCorrespondenceLanguage(cleanValue);
            case "postcode" -> {
                try {
                    registration.setPostcode(Integer.parseInt(cleanValue));
                } catch (NumberFormatException e) {
                    throw new RegistrationException("Postcode must be a number");
                }
            }
            case "startYear" -> {
                try {
                    registration.setStartYear(Integer.parseInt(cleanValue));
                } catch (NumberFormatException e) {
                    throw new RegistrationException("Start year must be a number");
                }
            }
            default -> throw new RegistrationException("Invalid field name: " + fieldName);
        }

        return registrationRepository.save(registration);
    }

    public void removeRegistrationFromSession(Long registrationId, String sessionId) {
        Registration registration = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new RegistrationException("Registration not found"));

        if (!registration.getSessionIds().contains(sessionId)) {
            throw new RegistrationException("Session not found in this registration");
        }

        registration.getSessionIds().remove(sessionId);

        if (registration.getSessionIds().isEmpty()) {
            registrationRepository.delete(registration);
        } else {
            registrationRepository.save(registration);
        }
    }

    public byte[] getRegistrationByEventId(String eventId) throws Exception {
        Event event = eventService.getEventById(eventId);

        String type = event.getType();

        List<String> sessionIds = event.getSessions().stream()
                .map(Session::getId)
                .toList();

        List<Registration> registrations;
        if (sessionIds.isEmpty()) {
            registrations = new ArrayList<>();
        } else {
            registrations = registrationRepository.findBySessionIdsIn(sessionIds);
        }

        try {
            XmlMapper xmlMapper = new XmlMapper();
            xmlMapper.disable(SerializationFeature.INDENT_OUTPUT);

            Object finalWrapper;
            if (type != null && type.contains("ZSS")) {
                finalWrapper = new VerderstuderenFileDTO(registrations);
            } else if (type != null && type.contains("ZSR")) {
                finalWrapper = new OpenlesdagenFileDTO(registrations);
            } else {

                throw new ServiceException(type + " is not a valid event for XML export");
            }

            String xmlContent = xmlMapper.writeValueAsString(finalWrapper);

            String xmlDeclaration = "<?xml version=\"1.0\" encoding=\"utf-8\" ?>\n";
            String finalXml = xmlDeclaration + xmlContent;

            return finalXml.getBytes(StandardCharsets.UTF_8);

        } catch (Exception e) {
            throw new ServiceException("Error generating XML for event " + eventId, e);
        }
    }
}