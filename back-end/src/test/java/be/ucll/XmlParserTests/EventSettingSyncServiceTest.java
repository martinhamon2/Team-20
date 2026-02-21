package be.ucll.XmlParserTests;

import be.ucll.model.*;
import be.ucll.repository.EventSettingRepository;
import be.ucll.repository.SessionSettingRepository;
import be.ucll.service.EventSettingSyncService;

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
class EventSettingSyncServiceTest {

    @Mock
    EventSettingRepository eventSettingRepository;

    @Mock
    SessionSettingRepository sessionSettingRepository;

    @InjectMocks
    EventSettingSyncService syncService;

    Event event;
    Session session;
    EventSetting eventSetting;
    SessionSetting sessionSetting;

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
    }

    @Test
    void test_syncEventAndSessionSettings_createsNewSettings() {
        // DB has no settings
        when(eventSettingRepository.findByEventId("E1")).thenReturn(null);
        when(sessionSettingRepository.findBySessionId("S1")).thenReturn(null);

        // Saving returns the same objects
        when(eventSettingRepository.save(eventSetting)).thenReturn(eventSetting);
        when(sessionSettingRepository.save(sessionSetting)).thenReturn(sessionSetting);

        syncService.syncEventAndSessionSettings(List.of(event));

        // Event setting attached and saved
        verify(eventSettingRepository).save(eventSetting);
        assertSame(eventSetting, event.getEventSetting());

        // Session setting attached and saved
        verify(sessionSettingRepository).save(sessionSetting);
        assertSame(sessionSetting, session.getSessionSetting());
    }

    @Test
    void test_syncEventAndSessionSettings_usesExistingSettings() {
        // DB already has settings
        EventSetting existingEventSetting = new EventSetting("E1");
        SessionSetting existingSessionSetting = new SessionSetting("S1");

        when(eventSettingRepository.findByEventId("E1")).thenReturn(existingEventSetting);
        when(sessionSettingRepository.findBySessionId("S1")).thenReturn(existingSessionSetting);

        syncService.syncEventAndSessionSettings(List.of(event));

        // Existing settings are used, save never called
        verify(eventSettingRepository, never()).save(any());
        verify(sessionSettingRepository, never()).save(any());

        assertSame(existingEventSetting, event.getEventSetting());
        assertSame(existingSessionSetting, event.getSessions().get(0).getSessionSetting());
    }

    @Test
    void test_syncEventAndSessionSettings_multipleSessions() {
        // Add second session
        Session session2 = new Session("S2", "Second Session", "TYPE", "CAT",
                LocalDate.now(), LocalDate.now().plusDays(1),
                LocalTime.of(13, 0), LocalTime.of(17, 0),
                "Room 2", "http://map2.url", 50);
        event.addSession(session2);

        SessionSetting sessionSetting2 = new SessionSetting(session2.getId());
        session2.setSessionSetting(sessionSetting2);

        when(eventSettingRepository.findByEventId("E1")).thenReturn(null);
        when(sessionSettingRepository.findBySessionId("S1")).thenReturn(null);
        when(sessionSettingRepository.findBySessionId("S2")).thenReturn(null);

        when(eventSettingRepository.save(eventSetting)).thenReturn(eventSetting);
        when(sessionSettingRepository.save(sessionSetting)).thenReturn(sessionSetting);
        when(sessionSettingRepository.save(sessionSetting2)).thenReturn(sessionSetting2);

        syncService.syncEventAndSessionSettings(List.of(event));

        // Both session settings saved
        verify(sessionSettingRepository).save(sessionSetting);
        verify(sessionSettingRepository).save(sessionSetting2);

        assertSame(sessionSetting, event.getSessions().get(0).getSessionSetting());
        assertSame(sessionSetting2, event.getSessions().get(1).getSessionSetting());
    }
}
