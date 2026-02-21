package be.ucll.RegistrationTests;

import be.ucll.controller.dto.RegistrationInput;
import be.ucll.exception.RegistrationException;
import be.ucll.model.Event;
import be.ucll.model.Registration;
import be.ucll.model.Session;
import be.ucll.repository.RegistrationRepository;
import be.ucll.service.EmailService;
import be.ucll.service.JwtService;
import be.ucll.service.RegistrationService;
import be.ucll.service.XmlPollingService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.env.Environment;
import org.springframework.security.oauth2.jwt.Jwt;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class RegistrationServiceTest {

        @Mock
        RegistrationRepository registrationRepository;

        @Mock
        private EmailService emailService;

        @Mock
        private XmlPollingService xmlPollingService;

        @Mock
        private JwtService jwtService;

        @Mock
        private Environment environment;

        @InjectMocks
        private RegistrationService registrationService;

        private Event event;
        private Session session;
        private Registration registration;
        private RegistrationInput registrationInput;
        private String token;

        @BeforeEach
        void setUp() throws Exception {
                registration = new Registration("John", "Doe", "Leuven", "Leuven", 3300, "+32472520379",
                                "john@mail.com", "UCLL", "Engels", 2018, "1990-01-01");
                registrationInput = new RegistrationInput("John", "Doe", "123 Main St", "County", 12345, "555-1234",
                                "john@mail.com", "UCLL", "Nederlands", 2025, "1990-05-17",new ArrayList<>(List.of("C-0002")));
                session = new Session("C-0002", "description", "type", "category", LocalDate.now().plusDays(2),
                                LocalDate.now().plusDays(6), null, null, "location", "mapUrl", 1);
                event = new Event("C-00001", "Networking", "ENG", "Networking by UCLL", LocalDate.now(),
                                LocalDate.now().plusDays(4));
                event.addSession(session);
                token = "testToken";
                registration.addSessionId(session.getId());

                lenient().when(environment.getActiveProfiles()).thenReturn(new String[] { "dev" });

        }

        @Test
        void givenInvalidSessionId_whenRegister_thenThrowException() throws Exception {
                when(xmlPollingService.pollAllXmlEvents()).thenReturn(new ArrayList<>());

                RuntimeException ex = assertThrows(RuntimeException.class,
                                () -> registrationService.registrateUserToSession(registrationInput));

                assertEquals("Session with ID C-0002 not found", ex.getMessage());
        }

        @Test
        void givenFullSession_whenRegister_thenThrowException() throws Exception {
                when(xmlPollingService.pollAllXmlEvents()).thenReturn(List.of(event));
                session.addRegistration(new Registration("Jane", "Doe", "Addr", "County", 3300, "555",
                                "someone@mail.com", "UCLL", "Nederlands", 2020, "1995-05-05"));

                RegistrationException ex = assertThrows(RegistrationException.class,
                                () -> registrationService.registrateUserToSession(registrationInput));

                assertEquals("Session C-0002 is full", ex.getMessage());
        }

        // ----------------- Cancel Session tests -----------------
        @Test
        void givenValidTokenAndSession_whenCancel_thenSessionRemovedAndEmailSent() {
                // arrange
                Jwt jwt = mock(Jwt.class);
                when(jwt.getSubject()).thenReturn(registration.getEmail());
                when(jwt.getClaim("type")).thenReturn("registration");
                when(jwtService.decodeToken(token)).thenReturn(jwt);
                when(registrationRepository.findBySessionIdsContaining(session.getId()))
                                .thenReturn(List.of(registration));

                doNothing().when(emailService).cancelMail(anyString(), anyString(), anyString(), anyMap());

                // act
                String result = registrationService.cancelSession(token, session.getId());

                // assert
                assertEquals("All sessions removed. Registration deleted successfully.", result);
                verify(emailService, times(1)).cancelMail(eq(registration.getEmail()), anyString(), anyString(),
                                anyMap());
                verify(registrationRepository, times(1)).delete(registration);
        }

        @Test
        void givenValidTokenAndMultipleSessions_whenCancel_thenSingleSessionRemoved() {
                // add a second session to registration
                registration.addSessionId("C-0003");

                Jwt jwt = mock(Jwt.class);
                when(jwt.getSubject()).thenReturn(registration.getEmail());
                when(jwt.getClaim("type")).thenReturn("registration");
                when(jwtService.decodeToken(token)).thenReturn(jwt);
                when(registrationRepository.findBySessionIdsContaining("C-0002")).thenReturn(List.of(registration));

                doNothing().when(emailService).cancelMail(anyString(), anyString(), anyString(), anyMap());

                String result = registrationService.cancelSession(token, session.getId());

                assertEquals("Session C-0002 removed from your registration successfully.", result);
                assertTrue(registration.getSessionIds().contains("C-0003"));
                verify(emailService, times(1)).cancelMail(eq(registration.getEmail()), anyString(), anyString(),
                                anyMap());
                verify(registrationRepository, times(1)).save(registration);
        }

        @Test
        void givenTokenWithWrongType_whenCancel_thenThrowRegistrationException() {
                Jwt jwt = mock(Jwt.class);
                when(jwt.getSubject()).thenReturn("someone@mail.com");
                when(jwt.getClaim("type")).thenReturn("not-registration");
                when(jwtService.decodeToken(token)).thenReturn(jwt);

                RegistrationException ex = assertThrows(RegistrationException.class,
                                () -> registrationService.cancelSession(token, session.getId()));

                assertEquals("Invalid token type for cancellation", ex.getMessage());
                verifyNoInteractions(emailService);
        }

        @Test
        void givenTokenForNonExistingRegistration_whenCancel_thenThrowRegistrationException() {
                Jwt jwt = mock(Jwt.class);
                when(jwt.getSubject()).thenReturn("someone@mail.com");
                when(jwt.getClaim("type")).thenReturn("registration");
                when(jwtService.decodeToken(token)).thenReturn(jwt);

                when(registrationRepository.findBySessionIdsContaining(session.getId())).thenReturn(List.of());

                RegistrationException ex = assertThrows(RegistrationException.class,
                                () -> registrationService.cancelSession(token, session.getId()));

                assertEquals("No registration found containing session C-0002", ex.getMessage());
                verifyNoInteractions(emailService);
        }
}
