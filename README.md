# front-end
## Dotenv

To get this project up and running, you'll need to create a **.env** file in the front-end directory.
The contents should look like this:

```properties
NEXT_PUBLIC_API_URL = http://localhost:3000
```
This will be the API URL where your back-end is running.

Also do not forgot to run these commands to install the packages and start up the application : 

```Install & Start-up
npm i
npm run dev
```

# back-end

## Database

Define the name of your local database and it's default user's name and password in  `application.yaml`

```
spring:
  datasource:
    url: jdbc:postgresql:<existing-db-name>
    username: <db-username>
    password: <db-password>
```

## Docker containers
As a prerequisite you must have installed docker and have it running on your device.

### Filebeat / elasticsearch / kibana
In your terminal cd into the "elk" directory and run the docker filler like this 

```
cd .\back-end\elk\
docker compose up -d
```

### Mailhog

In your terminal cd into the "mailhog" directory and run the docker filler like this 

```
cd .\back-end\mailhog\
docker compose up -d
```
