package be.ucll.SessionTests;

import be.ucll.exception.EventException;
import be.ucll.exception.SessionException;
import be.ucll.model.Event;
import be.ucll.model.Session;
import be.ucll.model.SessionSetting;
import be.ucll.repository.SessionSettingRepository;
import be.ucll.service.SessionService;
import be.ucll.service.XmlPollingService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class SessionServiceTest {

    @Mock
    private XmlPollingService xmlPollingService;

    @Mock
    private SessionSettingRepository sessionSettingRepository;

    @InjectMocks
    private SessionService sessionService;

    private Session session;
    private SessionSetting sessionSetting;
    private Event event;

    @BeforeEach
    void setUp() throws Exception {
        session = new Session(
                "C-00001", "description", "type", "category",
                LocalDate.now().plusDays(2), LocalDate.now().plusDays(6),
                null, null, "location", "mapUrl", 100);

        sessionSetting = new SessionSetting(session.getId());
        session.setSessionSetting(sessionSetting);

        event = new Event(
                "E-00001", "Networking", "ENG", "Networking by UCLL",
                LocalDate.now(), LocalDate.now().plusDays(4));
        event.addSession(session);

    }

    @Test
    void givenValidSession_whenChangeSessionStatus_thenStatusIsToggledToInactive() throws Exception {
        when(sessionSettingRepository.findBySessionId(session.getId())).thenReturn(sessionSetting);
        when(sessionSettingRepository.save(any(SessionSetting.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        sessionSetting.setActive(true);

        SessionSetting result = sessionService.changeSessionStatus(session.getId());

        assertNotNull(result);
        assertFalse(result.getActive(), "Active status should be toggled to false");
    }

    @Test
    void givenValidSession_whenChangeSessionStatus_thenStatusIsToggledToActive() throws Exception {
        when(sessionSettingRepository.findBySessionId(session.getId())).thenReturn(sessionSetting);
        when(sessionSettingRepository.save(any(SessionSetting.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        sessionSetting.setActive(false);

        SessionSetting result = sessionService.changeSessionStatus(session.getId());

        assertNotNull(result);
        assertTrue(result.getActive(), "Active status should be toggled to true");
    }

    @Test
    void givenInvalidSessionId_whenChangeSessionStatus_thenThrowException() {
        String invalidId = "INVALID";

        SessionException ex = assertThrows(SessionException.class,
                () -> sessionService.changeSessionStatus(invalidId));

        assertEquals("Session setting not found", ex.getMessage());
        verify(sessionSettingRepository, times(1)).findBySessionId(invalidId);
        verify(sessionSettingRepository, never()).save(any(SessionSetting.class));
    }

    @Test
    void givenValidSessionId_whenGetById_thenReturnSession() throws Exception {
        String validId = session.getId();
        when(xmlPollingService.pollAllXmlEvents()).thenReturn(List.of(event));

        Session result = sessionService.getById(validId);

        assertNotNull(result);
        assertEquals(validId, result.getId());
        assertEquals(session, result);
        verify(xmlPollingService, times(1)).pollAllXmlEvents();
    }

    @Test
    void givenInvalidSessionId_whenGetById_thenThrowException() throws Exception {
        String invalidId = "INVALID-ID";
        when(xmlPollingService.pollAllXmlEvents()).thenReturn(List.of(event));

        EventException ex = assertThrows(EventException.class,
                () -> sessionService.getById(invalidId));

        assertEquals("Session with id " + invalidId + " not found", ex.getMessage());
        verify(xmlPollingService, times(1)).pollAllXmlEvents();
    }

    @Test
    void givenNoEvents_whenGetById_thenThrowException() throws Exception {
        String anyId = "ANY-ID";
        when(xmlPollingService.pollAllXmlEvents()).thenReturn(Collections.emptyList());

        EventException ex = assertThrows(EventException.class,
                () -> sessionService.getById(anyId));

        assertEquals("Session with id " + anyId + " not found", ex.getMessage());
        verify(xmlPollingService, times(1)).pollAllXmlEvents();
    }
}