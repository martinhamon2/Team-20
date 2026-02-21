# Instructions

1. Create application.yaml in the root dir
2. Paste the following code in the created file:

```yaml
spring:
  profiles:
    active: dev
  mail:
    host: [YOUR_HOST]
    port: [YOUR_PORT]
    username: [YOUR_MAIL_ADDRESS]
    password: [PASSWORD]
    properties:
      mail:
        smtp:
          auth: true
          starttls:
            enable: true

jwt:
  secret-key: [YOUR_SECRET_KEY]
```
