DROP TABLE IF EXISTS EVENT_SETTINGS;
DROP TABLE IF EXISTS SESSION_SETTINGS;

CREATE TABLE EVENT_SETTINGS (
    id BIGSERIAL PRIMARY KEY,
    event_id TEXT,
    sort_order TEXT,
    sort_field TEXT,
    move_full_to_back BOOLEAN,
    move_past_to_back BOOLEAN,
    validate_overlapping BOOLEAN,
    phone_format TEXT,
    active BOOLEAN
);

CREATE TABLE SESSION_SETTINGS (
    id BIGSERIAL PRIMARY KEY,
    active BOOLEAN
);

