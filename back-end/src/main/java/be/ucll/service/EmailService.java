package be.ucll.service;

import be.ucll.model.EmailTemplate;
import be.ucll.repository.EmailTemplateRepository;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.thymeleaf.ITemplateEngine;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

import java.util.Map;
import java.util.HashMap;
import java.util.Optional;

@Service
public class EmailService {

    private final JavaMailSender mailSender;
    private final SpringTemplateEngine fileTemplateEngine; // Standard file-based engine
    private final ITemplateEngine dbTemplateEngine; // Our new String-based engine
    private final EmailTemplateRepository emailTemplateRepository;

    public EmailService(
            JavaMailSender mailSender,
            SpringTemplateEngine fileTemplateEngine,
            @Qualifier("dbTemplateEngine") ITemplateEngine dbTemplateEngine,
            EmailTemplateRepository emailTemplateRepository) {
        this.mailSender = mailSender;
        this.fileTemplateEngine = fileTemplateEngine;
        this.dbTemplateEngine = dbTemplateEngine;
        this.emailTemplateRepository = emailTemplateRepository;
    }

    @Transactional(readOnly = true)
    public void sendEmail(String to, String subject, String templateName, Map<String, Object> variables,
            Long registrationId, byte[] qrCodeBytes) {
        Map<String, Object> mutableVars = new HashMap<>(variables);
        mutableVars.put("registrationId", registrationId);
        mutableVars.put("hasQrCode", qrCodeBytes != null);
        sendEmailInternal(to, subject, templateName, mutableVars, qrCodeBytes);
    }

    @Transactional(readOnly = true)
    public void cancelMail(String to, String subject, String templateName, Map<String, Object> variables) {
        sendEmailInternal(to, subject, templateName, variables);
    }

    private void sendEmailInternal(String to, String subject, String templateName, Map<String, Object> variables,
            byte[] qrCodeBytes) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            helper.setTo(to);
            helper.setSubject(subject);

            Context context = new Context();
            context.setVariables(variables);

            String htmlContent = dbTemplateEngine.process(templateName, context);
            String finalSubject = subject;

            Optional<EmailTemplate> dbTemplateOpt = emailTemplateRepository.findByTemplateName(templateName);

            if (dbTemplateOpt.isPresent()) {
                EmailTemplate dbTemplate = dbTemplateOpt.get();
                htmlContent = dbTemplateEngine.process(dbTemplate.getContent(), context);

                if (dbTemplate.getSubject() != null && !dbTemplate.getSubject().isBlank()) {
                    finalSubject = dbTemplate.getSubject();
                }
            } else {
                htmlContent = fileTemplateEngine.process(templateName, context);
            }

            helper.setSubject(finalSubject);
            helper.setText(htmlContent, true);

            helper.addInline("qrCode", new ByteArrayResource(qrCodeBytes), "image/png");

            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send email", e);
        }
    }

    private void sendEmailInternal(String to, String defaultSubject, String templateName,
            Map<String, Object> variables) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            helper.setTo(to);

            Context context = new Context();
            context.setVariables(variables);

            String htmlContent;
            String finalSubject = defaultSubject;

            Optional<EmailTemplate> dbTemplateOpt = emailTemplateRepository.findByTemplateName(templateName);

            if (dbTemplateOpt.isPresent()) {
                EmailTemplate dbTemplate = dbTemplateOpt.get();
                htmlContent = dbTemplateEngine.process(dbTemplate.getContent(), context);

                if (dbTemplate.getSubject() != null && !dbTemplate.getSubject().isBlank()) {
                    finalSubject = dbTemplate.getSubject();
                }
            } else {
                htmlContent = fileTemplateEngine.process(templateName, context);
            }

            helper.setSubject(finalSubject);
            helper.setText(htmlContent, true);

            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send email using template: " + templateName, e);
        }
    }
}