# README

Make sure you have a Java JDK 21 installed.

## Installing PostgreSQL

Download from https://www.postgresql.org. It's useful to install pgAdmin as well (if you don't have it yet).

Connect to the database after installing and give the default user ('postgres') the password 'postgres':

```ALTER USER postgres WITH PASSWORD 'postgres'```

Create a new database for this project through the pgAdmin GUI (right-click the database-server and select 'create' > 'database').

## Starting-up

Create file `application.yaml` in the root folder (same folder as where `pom.xml` resides) with the following properties:

```
spring:
  datasource:
    url: jdbc:postgresql:<existing-db-name>
    username: <db-username>
    password: <db-password>
```

The value in `url` should specify an **existing** database in your locally-running PostgreSQL. The `public` schema in this database is used by default.

If you installed PostgreSQL as specified above, then both the username and password will be 'postgres'.

If you want to change additional properties from the `application.yaml` file in `src/main/resources`, then add them to your own `application.yaml` file with custom values.
The file in `src/main/resources` is shared through git, the one in the root folder is not checked-in.