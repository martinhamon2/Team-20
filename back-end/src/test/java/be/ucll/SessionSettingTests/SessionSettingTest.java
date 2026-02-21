package be.ucll.SessionSettingTests;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import be.ucll.model.SessionSetting;
import jakarta.validation.Validation;
import jakarta.validation.ValidatorFactory;

public class SessionSettingTest {
    private static ValidatorFactory validatorFactory;
    Long validId = (long) 1;
    String validSessionId = "SESSION_ID";
    Boolean validActive = false;
    SessionSetting validSessionSetting;

    @BeforeAll
    public static void createValidator() {
        validatorFactory = Validation.buildDefaultValidatorFactory();
        validatorFactory.getValidator();
    }

    @BeforeEach
    public void setUp() throws Exception {
        validSessionSetting = new SessionSetting(validSessionId);
        validSessionSetting.setId(validId);
        validSessionSetting.setActive(validActive);
    }

    @Test
    void givenValidValues_whenCreatingSessionSetting_thenEventSettingIsCreatedWithThoseValues() {
        assertNotNull(validSessionSetting);
        assertEquals(validId, validSessionSetting.getId());
        assertEquals(validSessionId, validSessionSetting.getSessionId());
        assertEquals(validActive, validSessionSetting.getActive());
    }

}
