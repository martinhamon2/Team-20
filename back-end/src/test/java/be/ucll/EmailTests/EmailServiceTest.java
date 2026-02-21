package be.ucll.EmailTests;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.atLeastOnce;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.reset;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.HashMap;
import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.javamail.JavaMailSender;
import org.thymeleaf.spring6.SpringTemplateEngine;
import org.thymeleaf.context.Context;

import be.ucll.repository.EmailTemplateRepository;
import be.ucll.service.EmailService;
import jakarta.mail.internet.MimeMessage;

@ExtendWith(MockitoExtension.class)
public class EmailServiceTest {
    @Mock
    private JavaMailSender mailSender;

    @Mock
    private EmailTemplateRepository emailTemplateRepository;

    @Mock
    private SpringTemplateEngine templateEngine;

    @InjectMocks
    private EmailService emailService;

    private MimeMessage mimeMessage;

    @BeforeEach
    public void setUp() {
        jakarta.mail.Session session = jakarta.mail.Session.getDefaultInstance(new java.util.Properties());
        mimeMessage = new MimeMessage(session);
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);
    }

    @Test
    public void testSendEmail_Success() throws Exception {
        Map<String, Object> variables = new HashMap<>();
        variables.put("name", "John");

        when(templateEngine.process(eq("email-template"), any(Context.class)))
                .thenReturn("<html>Email Body</html>");

        emailService.sendEmail(
                "test@example.com",
                "Test Subject",
                "email-template",
                variables,
                123L, new byte[0]);

        // Verify template engine called with correct context
        ArgumentCaptor<Context> contextCaptor = ArgumentCaptor.forClass(Context.class);
        verify(templateEngine, atLeastOnce()).process(eq("email-template"), contextCaptor.capture());

        Context captured = contextCaptor.getValue();
        assertEquals("John", captured.getVariable("name"));
        assertEquals(123L, captured.getVariable("registrationId"));

        // Verify email sent
        verify(mailSender).send(mimeMessage);
    }

    @Test
    public void testCancelMail_Success() throws Exception {
        Map<String, Object> variables = new HashMap<>();
        variables.put("info", "Cancellation");

        when(templateEngine.process(eq("cancel-template"), any(Context.class)))
                .thenReturn("<html>Cancel Body</html>");

        emailService.cancelMail(
                "cancel@example.com",
                "Cancel Subject",
                "cancel-template",
                variables);

        ArgumentCaptor<Context> contextCaptor = ArgumentCaptor.forClass(Context.class);
        verify(templateEngine).process(eq("cancel-template"), contextCaptor.capture());

        Context captured = contextCaptor.getValue();
        assertEquals("Cancellation", captured.getVariable("info"));

        verify(mailSender).send(mimeMessage);
    }

    @Test
    public void testSendEmail_Failure_ThrowsRuntimeException() throws Exception {
        when(mailSender.createMimeMessage()).thenThrow(new RuntimeException("Mail creation failed"));

        RuntimeException ex = assertThrows(RuntimeException.class, () -> {
            emailService.sendEmail("a@b.com", "Subject", "template", new HashMap<>(), 1L, null);
        });

        assertTrue(ex.getMessage().toLowerCase().contains("mail creation failed")
                || ex.getMessage().toLowerCase().contains("failed to send email"));
    }

    @Test
    public void testCancelMail_Failure_ThrowsRuntimeException() {
        reset(mailSender);

        doThrow(new RuntimeException("Mail creation failed"))
                .when(mailSender)
                .createMimeMessage();

        RuntimeException ex = assertThrows(RuntimeException.class, () -> {
            emailService.cancelMail("a@b.com", "Subject", "template", new HashMap<>());
        });

        assertTrue(ex.getMessage().toLowerCase().contains("mail creation failed")
                || ex.getMessage().toLowerCase().contains("failed to send email"));
    }

}