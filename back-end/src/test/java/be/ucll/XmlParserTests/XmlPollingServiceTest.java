package be.ucll.XmlParserTests;

import be.ucll.model.*;
import be.ucll.repository.EventSettingRepository;
import be.ucll.repository.SessionSettingRepository;
import be.ucll.service.EventSettingSyncService;
import be.ucll.service.XmlParserService;
import be.ucll.service.XmlPollingService;
import be.ucll.repository.RegistrationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class XmlPollingServiceTest {

    @Mock
    XmlParserService xmlParserService;

    @Mock
    EventSettingSyncService eventSettingSyncService;

    @Mock
    RegistrationRepository registrationRepository;

    @Mock
    EventSettingRepository eventSettingRepository;

    @Mock
    SessionSettingRepository sessionSettingRepository;

    @InjectMocks
    XmlPollingService xmlPollingService;

    Event event;
    Session session;
    EventSetting eventSetting;
    SessionSetting sessionSetting;
    Registration registration;

    @BeforeEach
    void setup() {
        event = new Event("E1", "TYPE", "NL", "Desc",
                LocalDate.now(), LocalDate.now().plusDays(1));

        session = new Session("S1", "Session Desc", "TYPE", "CAT",
                LocalDate.now(), LocalDate.now().plusDays(1),
                LocalTime.of(9, 0), LocalTime.of(17, 0),
                "Room 1", "http://map.url", 100);

        event.addSession(session);

        eventSetting = new EventSetting(event.getId());
        sessionSetting = new SessionSetting(session.getId());
        session.setSessionSetting(sessionSetting);
        event.setEventSetting(eventSetting);

        registration = new Registration(
                "John", "Doe", "Address", "County",
                1234, "0123456789", "john@example.com", "School", "Nederlands", 2023, "2000-01-01");
        registration.addSessionId(session.getId());
        registration.setId(1L);
    }

    @Test
    void test_pollAllXmlEvents_attachesSettingsAndRegistrations() throws Exception {
        // XML parser returns our event
        when(xmlParserService.parseAllEvents()).thenReturn(List.of(event));

        // No existing settings in DB
        when(eventSettingRepository.findByEventId("E1")).thenReturn(null);
        when(sessionSettingRepository.findBySessionId("S1")).thenReturn(null);

        // Saving new settings returns them
        when(eventSettingRepository.save(any(EventSetting.class))).thenReturn(eventSetting);
        when(sessionSettingRepository.save(any(SessionSetting.class))).thenReturn(sessionSetting);

        // Registration repository returns our registration
        when(registrationRepository.findAll()).thenReturn(List.of(registration));

        List<Event> events = xmlPollingService.pollAllXmlEvents();

        // Assertions
        assertEquals(1, events.size());
        Event polledEvent = events.get(0);
        assertSame(event, polledEvent);

        // Event setting attached
        assertSame(eventSetting, polledEvent.getEventSetting());

        // Session setting attached
        assertSame(sessionSetting, polledEvent.getSessions().get(0).getSessionSetting());

        // Registration attached
        assertEquals(1, session.getRegistrations().size());
        assertSame(registration, session.getRegistrations().get(0));

        // Verify sync called
        verify(eventSettingSyncService).syncEventAndSessionSettings(anyList());
    }

    @Test
    void test_pollAllXmlEvents_usesExistingSettings() throws Exception {
        when(xmlParserService.parseAllEvents()).thenReturn(List.of(event));

        // Existing settings in DB
        when(eventSettingRepository.findByEventId("E1")).thenReturn(eventSetting);
        when(sessionSettingRepository.findBySessionId("S1")).thenReturn(sessionSetting);

        when(registrationRepository.findAll()).thenReturn(List.of());

        List<Event> events = xmlPollingService.pollAllXmlEvents();

        assertEquals(1, events.size());
        Event polledEvent = events.get(0);

        // Existing settings used, no new save
        verify(eventSettingRepository, never()).save(any());
        verify(sessionSettingRepository, never()).save(any());

        assertSame(eventSetting, polledEvent.getEventSetting());
        assertSame(sessionSetting, polledEvent.getSessions().get(0).getSessionSetting());
    }

    @Test
    void test_enrichWithRegistrations_multipleSessions() throws Exception {
        Session session2 = new Session("S2", "Second Session", "TYPE", "CAT",
                LocalDate.now(), LocalDate.now().plusDays(1),
                LocalTime.of(13, 0), LocalTime.of(17, 0),
                "Room 2", "http://map2.url", 50);
        event.addSession(session2);

        Registration reg2 = new Registration(
                "Alice", "Smith", "Address", "County",
                5678, "0987654321", "alice@example.com", "School", "Nederlands", 2023, "1999-12-31");
        reg2.addSessionId(session2.getId());

        when(xmlParserService.parseAllEvents()).thenReturn(List.of(event));
        when(eventSettingRepository.findByEventId(anyString())).thenReturn(eventSetting);
        when(sessionSettingRepository.findBySessionId(anyString())).thenReturn(sessionSetting);
        when(registrationRepository.findAll()).thenReturn(List.of(registration, reg2));

        xmlPollingService.pollAllXmlEvents();

        // Each session has its registration attached
        assertEquals(1, session.getRegistrations().size());
        assertEquals(1, session2.getRegistrations().size());

        assertSame(registration, session.getRegistrations().get(0));
        assertSame(reg2, session2.getRegistrations().get(0));
    }
}
