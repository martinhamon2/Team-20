package be.ucll.EventTests;

import be.ucll.model.Event;
import jakarta.validation.*;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.Set;

import static org.hibernate.validator.internal.util.Contracts.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertEquals;

public class EventTest {
    private static ValidatorFactory validatorFactory;
    private static Validator validator;

    String validId = "C-0001";
    String validType = "meeting";
    String validLanguage = "English";
    String validDescription = "This is a meeting, everyone is welcome.";
    LocalDate validStartDate = LocalDate.now().plusDays(1);
    LocalDate validEndDate = LocalDate.now().plusDays(6);
    boolean validActive = false;

    Event validEvent;

    @BeforeAll
    public static void createValidator() {
        validatorFactory = Validation.buildDefaultValidatorFactory();
        validator = validatorFactory.getValidator();
    }

    @BeforeEach
    public void setUp() throws Exception {
        validEvent = new Event(validId, validType, validLanguage, validDescription, validStartDate, validEndDate);
    }

    // happy flow
    @Test
    void givenValidValues_whenCreatingEvent_thenEventIsCreatedWithThoseValues() {
        assertNotNull(validEvent);
        assertEquals(validType, validEvent.getType());
        assertEquals(validLanguage, validEvent.getLanguage());
        assertEquals(validDescription, validEvent.getDescription());
        assertEquals(validStartDate, validEvent.getBeginDate());
        assertEquals(validEndDate, validEvent.getEndDate());
        assertEquals(validActive, validEvent.getEventSetting().getActive());
    }

    // unhappy flow
    @Test
    void givenEmtpyType_whenCreatingEvent_thenExceptionIsThrown() {
        String emptyType = "";

        Event event = new Event(validId, emptyType, validLanguage, validDescription, validStartDate, validEndDate);

        Set<ConstraintViolation<Event>> violations = validator.validate(event);

        assertEquals(violations.size(), 1);
        ConstraintViolation<Event> violation = violations.iterator().next();
        assertEquals("Type should not be empty", violation.getMessage());
    }

    // unhappy flow
    @Test
    void givenEmtpyLanguage_whenCreatingEvent_thenExceptionIsThrown() {
        String emptyLanguage = null;

        Event event = new Event(validId, validType, emptyLanguage, validDescription, validStartDate, validEndDate);

        Set<ConstraintViolation<Event>> violations = validator.validate(event);

        assertEquals(violations.size(), 1);
        ConstraintViolation<Event> violation = violations.iterator().next();
        assertEquals("Language should not be empty", violation.getMessage());
    }

    // unhappy flow
    @Test
    void givenEmtpyDescription_whenCreatingEvent_thenExceptionIsThrown() {
        String emptyDescription = "";

        Event event = new Event(validId, validType, validLanguage, emptyDescription, validStartDate, validEndDate);

        Set<ConstraintViolation<Event>> violations = validator.validate(event);

        assertEquals(violations.size(), 1);
        ConstraintViolation<Event> violation = violations.iterator().next();
        assertEquals("Description should not be empty", violation.getMessage());
    }

    // unhappy flow
    @Test
    void givenEmtpyStartDate_whenCreatingEvent_thenExceptionIsThrown() {
        LocalDate emptyStartDate = null;

        Event event = new Event(validId, validType, validLanguage, validDescription, emptyStartDate, validEndDate);

        Set<ConstraintViolation<Event>> violations = validator.validate(event);

        assertEquals(violations.size(), 1);
        ConstraintViolation<Event> violation = violations.iterator().next();
        assertEquals("Begin date should not be empty", violation.getMessage());
    }

    // unhappy flow
    @Test
    void givenEmtpyEndDate_whenCreatingEvent_thenExceptionIsThrown() {
        LocalDate emptyEndDate = null;

        Event event = new Event(validId, validType, validLanguage, validDescription, validStartDate, emptyEndDate);

        Set<ConstraintViolation<Event>> violations = validator.validate(event);

        assertEquals(violations.size(), 1);
        ConstraintViolation<Event> violation = violations.iterator().next();
        assertEquals("End date should not be empty", violation.getMessage());
    }

    // unhappy flow
    @Test
    void givenEndDateBeforeStartDate_whenCreatingEvent_thenExceptionIsThrown() {
        LocalDate endDateBeforeStartDate = validStartDate.minusDays(1);

        Event event = new Event(validId, validType, validLanguage, validDescription, validStartDate,
                endDateBeforeStartDate);

        Set<ConstraintViolation<Event>> violations = validator.validate(event);

        assertEquals(violations.size(), 1);
        ConstraintViolation<Event> violation = violations.iterator().next();
        assertEquals("End date should not be before begin date", violation.getMessage());
    }
}
