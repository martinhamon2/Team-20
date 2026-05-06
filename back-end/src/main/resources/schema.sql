DROP TABLE IF EXISTS attraction_spare_part;
DROP TABLE IF EXISTS attraction;
DROP TABLE IF EXISTS park;
DROP TABLE IF EXISTS spare_part;
DROP TABLE IF EXISTS user_table;

CREATE TABLE park (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255)
);

CREATE TABLE attraction (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255),
    type VARCHAR(255),
    status VARCHAR(50),
    wait_time TIME,
    accessibility BOOLEAN,
    min_age INTEGER,
    min_height INTEGER,
    park_id BIGINT,
    CONSTRAINT fk_park FOREIGN KEY (park_id) REFERENCES park(id)
);

CREATE TABLE spare_part (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255),
    type VARCHAR(255)
);

CREATE TABLE attraction_spare_part (
    attraction_id BIGINT NOT NULL,
    spare_part_id BIGINT NOT NULL,
    PRIMARY KEY (attraction_id, spare_part_id),
    CONSTRAINT fk_attraction FOREIGN KEY (attraction_id) REFERENCES attraction(id),
    CONSTRAINT fk_spare_part FOREIGN KEY (spare_part_id) REFERENCES spare_part(id)
);

CREATE TABLE user_table (
    username VARCHAR(255) PRIMARY KEY,
    password VARCHAR(255),
    role TEXT -- VARCHAR(50) -> TEXT to allow the db to store an XSS script
);