package be.ucll.model;

import jakarta.persistence.*;

@Entity
@Table(name = "email_templates")
public class EmailTemplate {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String templateName;

    private String subject;

    @Lob // important for long HTML strings
    @Column(columnDefinition = "TEXT")
    private String content;

    protected EmailTemplate() {
    }

    public EmailTemplate(String templateName, String content, String subject) {
        setTemplateName(templateName);
        setContent(content);
        setSubject(subject);
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTemplateName() {
        return templateName;
    }

    public void setTemplateName(String templateName) {
        this.templateName = templateName;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }
}
