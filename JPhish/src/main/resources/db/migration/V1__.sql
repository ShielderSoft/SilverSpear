CREATE TABLE admin
(
    id               BIGINT AUTO_INCREMENT NOT NULL,
    last_update_date TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    create_date      TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted          BOOLEAN(1) NOT NULL,
    email            VARCHAR(255),
    password         VARCHAR(255),
    username         VARCHAR(255),
    CONSTRAINT "PRIMARY" PRIMARY KEY (id)
);

CREATE TABLE campaign
(
    id                     BIGINT AUTO_INCREMENT NOT NULL,
    last_update_date       TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    create_date            TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted                BOOLEAN(1) NOT NULL,
    campaign_description   VARCHAR(255),
    campaign_name          VARCHAR(255),
    end_time               time WITHOUT TIME ZONE,
    start_time             time WITHOUT TIME ZONE,
    target_user_id         BIGINT,
    campaign_email_body    VARCHAR(255),
    campaign_email_subject VARCHAR(255),
    campaign_target_email  VARCHAR(255),
    CONSTRAINT "PRIMARY" PRIMARY KEY (id)
);

CREATE TABLE resource_entity
(
    id                    BIGINT AUTO_INCREMENT NOT NULL,
    last_update_date      TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    create_date           TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted               BOOLEAN(1) NOT NULL,
    email_template        TEXT,
    landing_page_template TEXT,
    name                  VARCHAR(255),
    CONSTRAINT "PRIMARY" PRIMARY KEY (id)
);

CREATE TABLE sending_profile
(
    id               BIGINT AUTO_INCREMENT NOT NULL,
    last_update_date TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    create_date      TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted          BOOLEAN(1) NOT NULL,
    profile_desc     VARCHAR(255),
    profile_email_id VARCHAR(255),
    profile_name     VARCHAR(255),
    profilesmtp      VARCHAR(255),
    CONSTRAINT "PRIMARY" PRIMARY KEY (id)
);

CREATE TABLE session
(
    id               BIGINT AUTO_INCREMENT NOT NULL,
    last_update_date TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    create_date      TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMPL,
    deleted          BOOLEAN(1) NOT NULL,
    token            VARCHAR(255),
    username         VARCHAR(255),
    CONSTRAINT "PRIMARY" PRIMARY KEY (id)
);

CREATE TABLE "user"
(
    id               BIGINT AUTO_INCREMENT NOT NULL,
    last_update_date TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    create_date      TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted          BOOLEAN(1) NOT NULL,
    attacks          INTEGER,
    email            VARCHAR(255),
    feedback_taken   BOOLEAN(1) NOT NULL,
    name             VARCHAR(255),
    CONSTRAINT "PRIMARY" PRIMARY KEY (id)
);

CREATE TABLE user_group
(
    id               BIGINT AUTO_INCREMENT NOT NULL,
    last_update_date TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    create_date      TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted          BOOLEAN(1) NOT NULL,
    created_at       TIMESTAMP WITHOUT TIME ZONE,
    group_name       VARCHAR(255),
    CONSTRAINT "PRIMARY" PRIMARY KEY (id)
);

CREATE TABLE user_group_users
(
    user_group_id BIGINT NOT NULL,
    users_id      BIGINT NOT NULL
);

ALTER TABLE campaign
    ADD CONSTRAINT UK5wkoyqhqjw8gqbotjxw0a6u63 UNIQUE (target_user_id);

ALTER TABLE user_group_users
    ADD CONSTRAINT UKncylpsjf5j2ydrol9bw4kiw1i UNIQUE (users_id);

ALTER TABLE user_group_users
    ADD CONSTRAINT FK2nxn2lrsvhe42swjqobmn77fk FOREIGN KEY (users_id) REFERENCES "user" (id) ON DELETE NO ACTION;

ALTER TABLE campaign
    ADD CONSTRAINT FKrfr99x32cbbvqhoojrw18d2hn FOREIGN KEY (target_user_id) REFERENCES "user" (id) ON DELETE NO ACTION;

ALTER TABLE user_group_users
    ADD CONSTRAINT FKsrh863ojyvfmrgj1vv6dqp374 FOREIGN KEY (user_group_id) REFERENCES user_group (id) ON DELETE NO ACTION;

CREATE INDEX FKsrh863ojyvfmrgj1vv6dqp374 ON user_group_users (user_group_id);