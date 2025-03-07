ALTER TABLE user_group_users
DROP
FOREIGN KEY FK2nxn2lrsvhe42swjqobmn77fk;

ALTER TABLE campaign
DROP
FOREIGN KEY FKrfr99x32cbbvqhoojrw18d2hn;

ALTER TABLE user_group_users
DROP
FOREIGN KEY FKsrh863ojyvfmrgj1vv6dqp374;

DROP TABLE `admin`;

DROP TABLE campaign;

DROP TABLE resource_entity;

DROP TABLE sending_profile;

DROP TABLE session;

DROP TABLE user;

DROP TABLE user_group;

DROP TABLE user_group_users;