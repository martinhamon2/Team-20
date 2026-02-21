ALTER TABLE event_settings ADD template_name TEXT;

CREATE TABLE email_templates (
    id BIGSERIAL PRIMARY KEY,
    template_name TEXT,
    subject TEXT,
    content TEXT
);
