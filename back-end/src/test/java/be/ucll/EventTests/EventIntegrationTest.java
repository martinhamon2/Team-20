package be.ucll.EventTests;

import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import be.ucll.Application;
import be.ucll.model.Event;
import be.ucll.repository.RegistrationRepository;
import be.ucll.service.EventService;
import be.ucll.service.XmlParserService;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

@SpringBootTest(classes = Application.class)
@ActiveProfiles("dev")
@AutoConfigureMockMvc
public class EventIntegrationTest {
    @Autowired
    MockMvc mockMvc;

    @Autowired
    private RegistrationRepository registrationRepository;

    @MockitoBean
    private EventService eventService;

    @MockitoBean
    private XmlParserService xmlParserService;

    private Event event;

    @BeforeEach
    public void init() throws Exception {
        registrationRepository.deleteAll();
        event = new Event("C-00001", "Networking", "Nederlands", "Leer je studiegenoten kennen", LocalDate.now(),
                LocalDate.now().plusDays(7));

        when(xmlParserService.parseAllEvents()).thenReturn(List.of(event));
    }

    @Test
    @WithMockUser(username = "admin", roles = { "ADMIN" })
    public void givenEvents_whenGettingAllEvents_ThenAllEventsAreReturned() throws Exception {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        when(eventService.getEvents(authentication)).thenReturn(List.of(event));

        mockMvc.perform(get("/events")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$[0].type").value(event.getType()))
                .andExpect(jsonPath("$[0].language").value(event.getLanguage()))
                .andExpect(jsonPath("$[0].description").value(event.getDescription()))
                .andExpect(jsonPath("$[0].beginDate").value(event.getBeginDate().toString()))
                .andExpect(jsonPath("$[0].endDate").value(event.getEndDate().toString()));
    }

    @Test
    public void givenEventId_whenChangingAnEventToInactiveWithoutPermissions_ThenUnauthorizedErrorIsReturned()
            throws Exception {
        mockMvc.perform(put("/events/" + event.getId())
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(username = "admin", roles = { "ADMIN" })
    public void givenEventId_whenChangingAnEventToInactive_ThenTheEventWithThatIdIsChangedToInactive()
            throws Exception {
        when(eventService.changeEventStatus(event.getId())).thenReturn(event.getEventSetting());

        mockMvc.perform(put("/events/" + event.getId())
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.eventId").value(event.getEventSetting().getId()))
                .andExpect(jsonPath("$.sortOrder").value(event.getEventSetting().getSortOrder().name()))
                .andExpect(jsonPath("$.sortField").value(event.getEventSetting().getSortField().name()))
                .andExpect(jsonPath("$.moveFullToBack").value(event.getEventSetting().isMoveFullToBack()))
                .andExpect(jsonPath("$.movePastToBack").value(event.getEventSetting().isMovePastToBack()))
                .andExpect(jsonPath("$.validateOverlapping").value(event.getEventSetting().isValidateOverlapping()))
                .andExpect(jsonPath("$.phoneFormat").value(event.getEventSetting().getPhoneFormat().name()))
                .andExpect(jsonPath("$.active").value(event.getEventSetting().getActive()));
    }
}
