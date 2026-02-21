CREATE TABLE registration_session_ids (
    registration_id BIGINT NOT NULL,
    session_id TEXT NOT NULL,
    PRIMARY KEY (registration_id, session_id),
    FOREIGN KEY (registration_id) REFERENCES REGISTRATIONS(id)
);