# front-end
## Dotenv

To get this project up and running, you'll need to create a **.env** file in the front-end directory.
The contents should look like this:

```properties
NEXT_PUBLIC_API_URL = http://localhost:3000
```

This will be the API URL where your back-end is running.

# back-end

## Starting-up

Define the name of your local database and it's default user's name and password in  `application.yaml`

```
spring:
  datasource:
    url: jdbc:postgresql:<existing-db-name>
    username: <db-username>
    password: <db-password>
```
