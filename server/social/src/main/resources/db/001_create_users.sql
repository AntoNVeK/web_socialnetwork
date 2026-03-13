--liquibase formatted sql

--changeset anton:1

CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    last_name VARCHAR(50) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    middle_name VARCHAR(50),
    birth_date DATE,
    email VARCHAR(255) UNIQUE NOT NULL,
    photo VARCHAR(500),
    role VARCHAR(20) NOT NULL DEFAULT 'user',
    status VARCHAR(20) NOT NULL DEFAULT 'unconfirmed',
    password VARCHAR(255) NOT NULL
);


CREATE TABLE IF NOT EXISTS friendship (
    first_friend_id BIGINT,
    second_friend_id BIGINT,
    PRIMARY KEY (first_friend_id, second_friend_id),
    FOREIGN KEY (first_friend_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (second_friend_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT check_not_self CHECK (first_friend_id != second_friend_id)
);


