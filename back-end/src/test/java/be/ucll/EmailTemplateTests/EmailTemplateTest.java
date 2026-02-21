package be.ucll.EmailTemplateTests;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import be.ucll.model.EmailTemplate;
import jakarta.validation.Validation;
import jakarta.validation.ValidatorFactory;

public class EmailTemplateTest {
    private static ValidatorFactory validatorFactory;
    Long validId = (long) 1;

    String validTemplateName = "Test";
    String validSubject = "Subject";
    String validContent = "<p>Test</p>";

    EmailTemplate validEmailTemplate;

    @BeforeAll
    public static void createValidator() {
        validatorFactory = Validation.buildDefaultValidatorFactory();
        validatorFactory.getValidator();
    }

    @BeforeEach
    public void setUp() throws Exception {
        validEmailTemplate = new EmailTemplate(validTemplateName, validContent, validSubject);
        validEmailTemplate.setId(validId);
    }

    @Test
    void givenValidValues_whenCreatingEmailTemplate_thenEmailTemplateIsCreatedWithThoseValues() {
        assertNotNull(validEmailTemplate);
        assertEquals(validId, validEmailTemplate.getId());
        assertEquals(validTemplateName, validEmailTemplate.getTemplateName());
        assertEquals(validSubject, validEmailTemplate.getSubject());
        assertEquals(validContent, validEmailTemplate.getContent());
    }

}
