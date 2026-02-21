package be.ucll.SessionTests;

import be.ucll.model.Registration;
import be.ucll.model.Session;
import be.ucll.model.SessionSetting;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

public class SessionTest {
    private static ValidatorFactory validatorFactory;
    private static Validator validator;

    String validId = "C-00001";
    String validDescription = "Introduction to Java Programming";
    String validType = "workshop";
    String validCategory = "technology";
    LocalDate validBeginDate = LocalDate.now().plusDays(1);
    LocalDate validEndDate = LocalDate.now().plusDays(1);
    LocalTime validBeginTime = LocalTime.of(9, 0);
    LocalTime validEndTime = LocalTime.of(17, 0);
    String validLocation = "Room 101";
    String validMapUrl = "https://maps.example.com/room101";
    int validMaxCapacity = 50;

    Session validSession;

    @BeforeAll
    public static void createValidator() {
        validatorFactory = Validation.buildDefaultValidatorFactory();
        validator = validatorFactory.getValidator();
    }

    @BeforeEach
    public void setUp() {
        validSession = new Session(validId, validType, validDescription, validCategory, validBeginDate, validEndDate,
                validBeginTime, validEndTime, validLocation, validMapUrl, validMaxCapacity);
    }

    @Test
    void givenNullBeginDate_whenCreatingSession_thenSessionIsValid() {
        validSession.setBeginDate(null);

        Set<ConstraintViolation<Session>> violations = validator.validate(validSession);

        assertEquals(0, violations.size());
    }

    @Test
    void givenNullEndDate_whenCreatingSession_thenSessionIsValid() {
        validSession.setEndDate(null);

        Set<ConstraintViolation<Session>> violations = validator.validate(validSession);

        assertEquals(0, violations.size());
    }

    @Test
    void givenNullBeginTime_whenCreatingSession_thenSessionIsValid() {
        validSession.setBeginTime(null);

        Set<ConstraintViolation<Session>> violations = validator.validate(validSession);

        assertEquals(0, violations.size());
    }

    @Test
    void givenNullEndTime_whenCreatingSession_thenSessionIsValid() {
        validSession.setEndTime(null);

        Set<ConstraintViolation<Session>> violations = validator.validate(validSession);

        assertEquals(0, violations.size());
    }

    @Test
    void givenOverlappingSessions_whenCheckingOverlap_thenReturnsTrue() {
        Session otherSession = new Session("C-00002", validType, validDescription, validCategory, validBeginDate,
                validEndDate, validBeginTime, validEndTime, validLocation, validMapUrl, validMaxCapacity);

        assertTrue(validSession.overlapsWith(otherSession));
    }

    @Test
    void givenNonOverlappingSessions_whenCheckingOverlap_thenReturnsFalse() {
        Session otherSession = new Session("C-00002", validType, validDescription, validCategory,
                validBeginDate.plusDays(1), validEndDate.plusDays(1), validBeginTime, validEndTime, validLocation,
                validMapUrl, validMaxCapacity);

        assertFalse(validSession.overlapsWith(otherSession));
    }

    @Test
    void givenSessionWithRegistrations_whenAddingRegistration_thenRegistrationIsAdded() {
        Registration registration = new Registration("Nathan", "Jordens", "Leuvenselaan 77/2", "Tienen", 3300,
                "+32 472 52 03 79", "nathanjordens2005@gmail.com", "UCLL", "Dutch", 2023, "2005-08-20");
        validSession.addRegistration(registration);

        assertEquals(1, validSession.getRegistrations().size());
        assertEquals(registration, validSession.getRegistrations().get(0));
    }

    @Test
    void givenNullId_whenCreatingSession_thenExceptionIsThrown() {
        String nullId = null;

        Session session = new Session(nullId, validType, validDescription, validCategory, validBeginDate, validEndDate,
                validBeginTime, validEndTime, validLocation, validMapUrl, validMaxCapacity);

        Set<ConstraintViolation<Session>> violations = validator.validate(session);

        assertEquals(1, violations.size());
        ConstraintViolation<Session> violation = violations.iterator().next();
        assertEquals("Id should not be empty", violation.getMessage());
    }

    @Test
    void givenNullLocation_whenCreatingSession_thenSessionIsValid() {
        validSession.setLocation(null);

        Set<ConstraintViolation<Session>> violations = validator.validate(validSession);

        assertEquals(0, violations.size());
    }

    @Test
    void givenNullMapUrl_whenCreatingSession_thenSessionIsValid() {
        validSession.setMapUrl(null);

        Set<ConstraintViolation<Session>> violations = validator.validate(validSession);

        assertEquals(0, violations.size());
    }

    @Test
    void givenNullSessionSetting_whenSettingSessionSetting_thenSessionSettingIsUpdated() {
        SessionSetting newSetting = new SessionSetting("TEST");
        newSetting.setActive(true);

        validSession.setSessionSetting(newSetting);

        assertNotNull(validSession.getSessionSetting());
        assertTrue(validSession.getSessionSetting().getActive());
    }
}
