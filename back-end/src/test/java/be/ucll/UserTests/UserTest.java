package be.ucll.UserTests;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import java.util.Set;

import org.junit.jupiter.api.*;

import be.ucll.model.Role;
import be.ucll.model.User;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;

public class UserTest {
    private static ValidatorFactory validatorFactory;
    private static Validator validator;

    String validUsername = "John";
    String validEmail = "John@mail.com";
    String validPassword = "John123!";
    Role validRole = Role.ADMIN;

    User validUser;

    @BeforeAll
    public static void createValidator() {
        validatorFactory = Validation.buildDefaultValidatorFactory();
        validator = validatorFactory.getValidator();
    }

    @BeforeEach
    public void setUp() throws Exception {
        validUser = new User(validUsername, validEmail, validPassword, validRole);
    }

    // happy flow
    @Test
    void givenValidValues_whenCreatingUser_thenUserIsCreatedWithThoseValues() {
        assertNotNull(validUser);
        assertEquals(validUsername, validUser.getUsername());
        assertEquals(validEmail, validUser.getEmail());
        assertEquals(validPassword, validUser.getPassword());
        assertEquals(validRole.toString(), validUser.getRole().toString());
    }

    // unhappy flow
    @Test
    void givenEmptyUsername_whenCreatingUser_thenExceptionIsThrown() {
        String emptyUsername = "";

        User user = new User(emptyUsername, validEmail, validPassword, validRole);

        Set<ConstraintViolation<User>> violations = validator.validate(user);

        assertEquals(violations.size(), 1);
        ConstraintViolation<User> violation = violations.iterator().next();
        assertEquals("Username should not be empty", violation.getMessage());
    }

    // unhappy flow
    @Test
    void givenEmptyEmail_whenCreatingUser_thenExceptionIsThrown() {
        String emptyEmail = "";

        User user = new User(validUsername, emptyEmail, validPassword, validRole);

        Set<ConstraintViolation<User>> violations = validator.validate(user);

        assertEquals(violations.size(), 1);
        ConstraintViolation<User> violation = violations.iterator().next();
        assertEquals("Email should not be empty", violation.getMessage());
    }

    // unhappy flow
    @Test
    void givenEmptyPassword_whenCreatingUser_thenExceptionIsThrown() {
        String emptyPassword = "";

        User user = new User(validUsername, validEmail, emptyPassword, validRole);

        Set<ConstraintViolation<User>> violations = validator.validate(user);

        assertEquals(violations.size(), 1);
        ConstraintViolation<User> violation = violations.iterator().next();
        assertEquals("Password should not be empty", violation.getMessage());
    }

    // unhappy flow
    @Test
    void givenNullRole_whenCreatingUser_thenExceptionIsThrown() {
        Role nullRole = null;

        User user = new User(validUsername, validEmail, validPassword, nullRole);

        Set<ConstraintViolation<User>> violations = validator.validate(user);

        assertEquals(violations.size(), 1);
        ConstraintViolation<User> violation = violations.iterator().next();
        assertEquals("must not be null", violation.getMessage());
    }

    @AfterAll
    public static void close() {
        validatorFactory.close();
    }
}
