package be.ucll.controller.dto;

public record EmailTemplateDTO (
    String templateName,
    String content,
    String subject) {
}
