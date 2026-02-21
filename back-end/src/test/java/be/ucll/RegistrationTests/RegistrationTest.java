package be.ucll.RegistrationTests;

import be.ucll.model.Registration;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

public class RegistrationTest {
    private static ValidatorFactory validatorFactory;
    private static Validator validator;

    String validSessionId = "C-0001";
    String validFirstName = "John";
    String validLastName = "Doe";
    String validAddress = "Main Street 1";
    String validCounty = "County";
    Integer validPostcode = 1000;
    String validPhoneNumber = "0123456789";
    String validEmail = "John.Doe@gmail.com";
    String validSchool = "UCLL";
    String validCorrespondenceLanguage = "Nederlands";
    Integer validStartYear = 2023;
    String validDateOfBirth = "2000-01-01";

    Registration validRegistration;

    @BeforeAll
    public static void createValidator() {
        validatorFactory = Validation.buildDefaultValidatorFactory();
        validator = validatorFactory.getValidator();
    }

    @BeforeEach
    public void setUp() {
        validRegistration = new Registration(validFirstName, validLastName, validAddress, validCounty, validPostcode,
                validPhoneNumber, validEmail, validSchool, validCorrespondenceLanguage, validStartYear,
                validDateOfBirth);
        validRegistration.addSessionId(validSessionId);
    }

    // happy flow
    @Test
    void givenValidValues_whenCreatingRegistration_thenRegistrationIsCreatedWithThoseValues() {
        assertNotNull(validRegistration);
        assertEquals(validFirstName, validRegistration.getFirstName());
        assertEquals(validLastName, validRegistration.getLastName());
        assertEquals(validAddress, validRegistration.getAddress());
        assertEquals(validCounty, validRegistration.getCounty());
        assertEquals(validPostcode, validRegistration.getPostcode());
        assertEquals(validPhoneNumber, validRegistration.getPhoneNumber());
        assertEquals(validEmail, validRegistration.getEmail());
        assertEquals(validSchool, validRegistration.getSchool());
        assertEquals(validCorrespondenceLanguage, validRegistration.getCorrespondenceLanguage());
        assertEquals(validStartYear, validRegistration.getStartYear());
        assertEquals(validDateOfBirth, validRegistration.getDateOfBirth());
        assertEquals(validSessionId, validRegistration.getSessionIds().getFirst());
    }

    // unhappy flow
    @Test
    void givenEmtpyFirstName_whenCreatingRegistration_thenExceptionIsThrown() {
        String emptyFirstName = "";

        Registration registration = new Registration(emptyFirstName, validLastName, validAddress, validCounty,
                validPostcode, validPhoneNumber, validEmail, validSchool, validCorrespondenceLanguage, validStartYear,
                validDateOfBirth);
        registration.addSessionId(validSessionId);

        Set<ConstraintViolation<Registration>> violations = validator.validate(registration);

        assertEquals(violations.size(), 1);
        ConstraintViolation<Registration> violation = violations.iterator().next();
        assertEquals("Firstname should not be blank.", violation.getMessage());
    }

    // unhappy flow
    @Test
    void givenEmtpyLastName_whenCreatingRegistration_thenExceptionIsThrown() {
        String emptyLastName = "";

        Registration registration = new Registration(validFirstName, emptyLastName, validAddress, validCounty,
                validPostcode, validPhoneNumber, validEmail, validSchool, validCorrespondenceLanguage, validStartYear,
                validDateOfBirth);
        registration.addSessionId(validSessionId);

        Set<ConstraintViolation<Registration>> violations = validator.validate(registration);

        assertEquals(violations.size(), 1);
        ConstraintViolation<Registration> violation = violations.iterator().next();
        assertEquals("Lastname should not be blank.", violation.getMessage());
    }

    // unhappy flow
    @Test
    void givenEmtpyAddress_whenCreatingRegistration_thenExceptionIsThrown() {
        String emptyAddress = "";

        Registration registration = new Registration(validFirstName, validLastName, emptyAddress, validCounty,
                validPostcode, validPhoneNumber, validEmail, validSchool, validCorrespondenceLanguage, validStartYear,
                validDateOfBirth);
        registration.addSessionId(validSessionId);

        Set<ConstraintViolation<Registration>> violations = validator.validate(registration);

        assertEquals(violations.size(), 1);
        ConstraintViolation<Registration> violation = violations.iterator().next();
        assertEquals("Address should not be blank.", violation.getMessage());
    }

    // unhappy flow
    @Test
    void givenEmtpyCounty_whenCreatingRegistration_thenExceptionIsThrown() {
        String emptyCounty = "";

        Registration registration = new Registration(validFirstName, validLastName, validAddress, emptyCounty,
                validPostcode, validPhoneNumber, validEmail, validSchool, validCorrespondenceLanguage, validStartYear,
                validDateOfBirth);
        registration.addSessionId(validSessionId);

        Set<ConstraintViolation<Registration>> violations = validator.validate(registration);

        assertEquals(violations.size(), 1);
        ConstraintViolation<Registration> violation = violations.iterator().next();
        assertEquals("County should not be blank.", violation.getMessage());
    }

    // unhappy flow
    @Test
    void givenNullPostcode_whenCreatingRegistration_thenExceptionIsThrown() {
        Integer nullPostcode = null;

        Registration registration = new Registration(validFirstName, validLastName, validAddress, validCounty,
                nullPostcode, validPhoneNumber, validEmail, validSchool, validCorrespondenceLanguage, validStartYear,
                validDateOfBirth);
        registration.addSessionId(validSessionId);

        Set<ConstraintViolation<Registration>> violations = validator.validate(registration);

        assertEquals(violations.size(), 1);
        ConstraintViolation<Registration> violation = violations.iterator().next();
        assertEquals("Postcode should not be empty.", violation.getMessage());
    }

    // unhappy flow
    @Test
    void givenEmtpyPhoneNumber_whenCreatingRegistration_thenExceptionIsThrown() {
        String emptyPhoneNumber = "";

        Registration registration = new Registration(validFirstName, validLastName, validAddress, validCounty,
                validPostcode, emptyPhoneNumber, validEmail, validSchool, validCorrespondenceLanguage, validStartYear,
                validDateOfBirth);
        registration.addSessionId(validSessionId);

        Set<ConstraintViolation<Registration>> violations = validator.validate(registration);

        assertEquals(violations.size(), 1);
        ConstraintViolation<Registration> violation = violations.iterator().next();
        assertEquals("Phone number should not be blank.", violation.getMessage());
    }

    // unhappy flow
    @Test
    void givenInvalidEmail_whenCreatingRegistration_thenExceptionIsThrown() {
        String invalidEmail = "invalidEmail";

        Registration registration = new Registration(validFirstName, validLastName, validAddress, validCounty,
                validPostcode, validPhoneNumber, invalidEmail, validSchool, validCorrespondenceLanguage, validStartYear,
                validDateOfBirth);
        registration.addSessionId(validSessionId);

        Set<ConstraintViolation<Registration>> violations = validator.validate(registration);

        assertEquals(violations.size(), 1);
        ConstraintViolation<Registration> violation = violations.iterator().next();
        assertEquals("Email should be valid", violation.getMessage());
    }
}
