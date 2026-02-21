package be.ucll.EventTests;

import be.ucll.controller.dto.EventSettingDTO;
import be.ucll.exception.EventException;
import be.ucll.model.*;
import be.ucll.repository.EventSettingRepository;
import be.ucll.repository.SessionSettingRepository;
import be.ucll.service.EventService;
import be.ucll.service.XmlPollingService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class EventServiceTest {

        @Mock
        XmlPollingService xmlPollingService;

        @Mock
        EventSettingRepository eventSettingRepository;

        @Mock
        SessionSettingRepository sessionSettingRepository;

        @InjectMocks
        EventService eventService;

        private EventSettingDTO eventSettingDTO;

        @BeforeEach
        void setUp() {
                eventSettingDTO = new EventSettingDTO(
                                SortOrder.ASC, SortField.TYPE, false, false, false, true, PhoneFormat.INTERNATIONAL,
                                "confirmation-template", "blue", "white");
        }

        private Event createEvent(String id, boolean active, LocalDate begin, LocalDate end) {
                EventSetting setting = new EventSetting("C-0001", SortOrder.ASC, SortField.BEGINDATE, false, false,
                                true, true, PhoneFormat.INTERNATIONAL);
                setting.setActive(active);
                Event e = new Event("C-0001", "ZSR4", "N", "Openlesdagen Gent, industrieel ingenieur - krokus 2025",
                                LocalDate.of(2025, 3, 3), LocalDate.of(2025, 3, 7));
                e.setId(id);
                e.setEventSetting(setting);
                e.setBeginDate(begin);
                e.setEndDate(end);
                return e;
        }

        @Test
        void givenInactiveEvent_whenGetByIdCalled_thenThrowsEventNotActiveException() throws Exception {
                Event event = createEvent("1", false, LocalDate.now().minusDays(1), LocalDate.now().plusDays(1));
                when(xmlPollingService.pollAllXmlEvents()).thenReturn(List.of(event));

                EventException ex = assertThrows(EventException.class,
                                () -> eventService.getById("1", false));
                assertEquals("Event not active", ex.getMessage());
        }

        @Test
        void givenEventNotStarted_whenGetByIdCalled_thenThrowsEventNotStartedException() throws Exception {
                Event event = createEvent("2", true, LocalDate.now().plusDays(1), LocalDate.now().plusDays(2));
                when(xmlPollingService.pollAllXmlEvents()).thenReturn(List.of(event));

                EventException ex = assertThrows(EventException.class,
                                () -> eventService.getById("2", false));
                assertEquals("Event has not started yet", ex.getMessage());
        }

        @Test
        void givenEventAlreadyEnded_whenGetByIdCalled_thenThrowsEventAlreadyEndedException() throws Exception {
                Event event = createEvent("3", true, LocalDate.now().minusDays(3), LocalDate.now().minusDays(1));
                when(xmlPollingService.pollAllXmlEvents()).thenReturn(List.of(event));

                EventException ex = assertThrows(EventException.class,
                                () -> eventService.getById("3", false));
                assertEquals("Event has already ended", ex.getMessage());
        }

        @Test
        void givenActiveOngoingEvent_whenGetByIdCalled_thenReturnsEvent() throws Exception {
                Event event = createEvent("4", true, LocalDate.now().minusDays(1), LocalDate.now().plusDays(1));
                when(xmlPollingService.pollAllXmlEvents()).thenReturn(List.of(event));

                Event result = eventService.getById("4", false);
                assertNotNull(result);
                assertEquals("4", result.getId());
        }

        @Test
        void givenAllEvents_whenGetAllEvents_thenAllEventsAreReturned() throws Exception {
                Event e1 = createEvent("1", true, LocalDate.now().minusDays(1), LocalDate.now().plusDays(1));
                Event e2 = createEvent("2", true, LocalDate.now().minusDays(1), LocalDate.now().plusDays(1));
                Event e3 = createEvent("3", true, LocalDate.now().minusDays(1), LocalDate.now().plusDays(1));

                when(xmlPollingService.pollAllXmlEvents()).thenReturn(List.of(e1, e2, e3));

                List<Event> events = eventService.getEvents(null); // unauthenticated user
                assertEquals(3, events.size());
        }

        @Test
        void givenInvalidEventId_whenUpdatingSettings_thenThrowsEventException() {
                EventException ex = assertThrows(EventException.class,
                                () -> eventService.updateEventSetting("C-00001", eventSettingDTO));
                assertEquals("Event not found", ex.getMessage());
        }

        @Test
        void givenActiveEvent_whenChangeEventStatus_thenEventAndSessionsAreDeactivated() throws Exception {
                EventSetting eventSetting = new EventSetting("C-0001", SortOrder.ASC, SortField.BEGINDATE, false, false,
                                true, true, PhoneFormat.INTERNATIONAL);
                eventSetting.setActive(true);

                SessionSetting ss1 = new SessionSetting("S-0001");
                ss1.setActive(true);
                SessionSetting ss2 = new SessionSetting("S-0002");
                ss2.setActive(true);

                Session s1 = new Session("S-0001", "ZSR5", "Statica: college", "ZBOPL", LocalDate.of(2025, 3, 3),
                                LocalDate.of(2025, 3, 3), LocalTime.of(11, 15), LocalTime.of(12, 45),
                                "Gebroeders De Smetstraat 1, 9000 Gent (E036 - Groot auditorium)",
                                "https://www.google.be/maps/place/KU+Leuven...", 20);
                s1.setSessionSetting(ss1);
                Session s2 = new Session("S-0002", "ZSR5", "Statica: college", "ZBOPL", LocalDate.of(2025, 3, 3),
                                LocalDate.of(2025, 3, 3), LocalTime.of(11, 15), LocalTime.of(12, 45),
                                "Gebroeders De Smetstraat 1, 9000 Gent (E036 - Groot auditorium)",
                                "https://www.google.be/maps/place/KU+Leuven...", 20);
                s2.setSessionSetting(ss2);

                Event event = new Event("C-0001", "ZSR4", "N", "Openlesdagen Gent, industrieel ingenieur - krokus 2025",
                                LocalDate.of(2025, 3, 3), LocalDate.of(2025, 3, 7));
                event.setEventSetting(eventSetting);
                event.setSessions(List.of(s1, s2));

                when(xmlPollingService.pollAllXmlEvents()).thenReturn(List.of(event));
                when(eventSettingRepository.save(eventSetting)).thenReturn(eventSetting);
                when(sessionSettingRepository.save(ss1)).thenReturn(ss1);
                when(sessionSettingRepository.save(ss2)).thenReturn(ss2);

                EventSetting result = eventService.changeEventStatus("C-0001");

                assertFalse(result.getActive());
                assertFalse(ss1.getActive());
                assertFalse(ss2.getActive());
        }

        @Test
        void givenExistingEvent_whenUpdateEventSetting_thenFieldsAreUpdatedAndSaved() throws Exception {
                String eventId = "C-0001";

                EventSetting existing = new EventSetting("C-0001", SortOrder.ASC, SortField.TYPE, false, false, false,
                                true, PhoneFormat.NATIONAAL);
                EventSettingDTO dto = new EventSettingDTO(SortOrder.DESC, SortField.BEGINDATE, true, true, true,
                                true, PhoneFormat.INTERNATIONAL, "Test2", "red", "black");

                when(eventSettingRepository.findByEventId(eventId)).thenReturn(existing);
                when(eventSettingRepository.save(existing)).thenReturn(existing);

                EventSetting result = eventService.updateEventSetting(eventId, dto);

                assertEquals(SortOrder.DESC, result.getSortOrder());
                assertEquals(SortField.BEGINDATE, result.getSortField());
                assertTrue(result.isMoveFullToBack());
                assertTrue(result.isMovePastToBack());
                assertTrue(result.isValidateOverlapping());
                assertEquals(PhoneFormat.INTERNATIONAL, result.getPhoneFormat());
        }

}
