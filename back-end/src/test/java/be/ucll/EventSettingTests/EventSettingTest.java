package be.ucll.EventSettingTests;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import be.ucll.model.EventSetting;
import be.ucll.model.PhoneFormat;
import be.ucll.model.SortField;
import be.ucll.model.SortOrder;
import jakarta.validation.Validation;
import jakarta.validation.ValidatorFactory;

public class EventSettingTest {
    private static ValidatorFactory validatorFactory;
    SortOrder validSortOrder = SortOrder.ASC;
    SortField validSortField = SortField.TYPE;
    boolean validMoveFullToBack = true;
    boolean validMovePastToBack = true;
    boolean validValidateOverlapping = true;
    boolean canUnsubscribe = true;
    PhoneFormat validPhoneFormat = PhoneFormat.INTERNATIONAL;

    EventSetting validEventSetting;

    @BeforeAll
    public static void createValidator() {
        validatorFactory = Validation.buildDefaultValidatorFactory();
        validatorFactory.getValidator();
    }

    @BeforeEach
    public void setUp() throws Exception {
        validEventSetting = new EventSetting("C-000001", validSortOrder, validSortField, validMoveFullToBack,
                validMovePastToBack,
                validValidateOverlapping, canUnsubscribe, validPhoneFormat);
    }

    @Test
    void givenValidValues_whenCreatingEventSetting_thenEventSettingIsCreatedWithThoseValues() {
        assertNotNull(validEventSetting);
        assertEquals(validSortOrder, validEventSetting.getSortOrder());
        assertEquals(validSortField, validEventSetting.getSortField());
        assertEquals(validMoveFullToBack, validEventSetting.isMoveFullToBack());
        assertEquals(validMovePastToBack, validEventSetting.isMovePastToBack());
        assertEquals(validValidateOverlapping, validEventSetting.isValidateOverlapping());
        assertEquals(validPhoneFormat, validEventSetting.getPhoneFormat());
    }
}
