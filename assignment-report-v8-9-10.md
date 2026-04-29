# 01 Introduction
- Team Number:
- Team Member Names: 
- Team Member r-Numbers:
- Link to github repo: 
- Link to file in Github Repo with the README.md for running the application:
- Describe the application and its functionalities (summary):
- List the technologies and frameworks used for front- as well as back-end (bullet points):
    - Frontend:
    - Backend:
- In the following table, fill in the first names of the respective roles that have been taken:

| Topic | Blue 1 | Blue 2 | Red |
|----------|----------|----------|----------|
| 02 Cryptography  |          |          |          |
| 03 API Security  |          |          |          |
| 04 Injections   |          |          |          |
| 05 Vulnerable & Outdated Components  |          |          |          |
| 06 & 07 Session Management & Clickjacking |          |          |          |
| 08 Exception Handling, Logging & Monitoring  |          |          |          |
| 09 Secure CI / CD   |          |          |          |


# 02 Cryptography 

## TLS
Draw a Data Flow Diagram (incl. trust boundaries) of your application
- if already deployed somewhere, or
- as if it would be deployed somewhere (simulate)

Explain what TLS Termination Model you would choose for each of the trust boundary crossings and why.

## Signup
If you don't have an endpoint for registering or signing up users yet, implement this functionality. Implement it so that users can not choose an easy, weak or default password (and maybe not even choose a breached one). Describe your setup and configuration, based on what threats you are mititgating.

## Digital Signatures
Describe where your team applies digital signatures in the code or in the software development proces. What risks are you mitigating and how are you doing it exactly?

## Password Storage
Describe you password storing mechanism, the threats you are mitigating and the threats that you can or did not mitigate.

## Secret / Key Management
Wherever you use a secret (for crypto purposes), explain where and how you store the secret. List all secrets used in your application (name:value). Note: Off course it's not good practice to write them down in a report, but I must be able to assess whether your secrets were properly defined or not. By putting them in the report (and not in the code repository) we're using an out-of-band mechanism as incident response teams would be doing when an attack is taking place.

## Blue Teaming & Red Teaming
Describe how you tackled both the blue and red teaming activities. If already mentioned above, reference to the above, but make sure you make an overview of both types of activities in here. 


# 03 API Security

## Authentication
Blue Team:
- Implement at least one of these (you can use Mailhog (in a docker) to simulate the SMTP server - or an alternative): 
    - A secure password forgotton feature
    - A secure multifactor authentication
- Evaluate the effect of response timing for username & password enumeration (implement measures if prone to this vulnerability)

Red Team:
- Perform tests on the implemented features and see whether you can perform a timing attack

## Authorization - Assessment AS IS
Blue Team: Start with the overview of your current API endpoints (as seen in the LAB), you can add the Excel "yyyymmdd API enpoints" file to the folder "Appendices" (cf later). 

Red Team: Independently from the blue team, look at all API enpoints and try out several API authorization vulnerabilities for all roles, all objects and all properties (in the browser, using Burp, ...).

## Authorization - Add (unless if you already have this)
Make sure you have:
- at least one endpoint only available for an admin role
- at least one endpoint for a user to see it's own profile
- at least one endpoint available for both roles admin and user but admin can PATCH one or more fields than the user
- at least one role grouping several users (a team, family, ... - depending on your application) that can only see their own resources (and a superuser who can add, remove these members - for the group(s) (s)he owns/leads)

## Authorization - Assessment FINAL
After the AS IS, and the added features, retest the API again. What did both teams discover and how did you change your code?

In the "Appendices" folder, Excel "yyyymmdd API enpoints" add a column and indicate what you changed, added or removed. Also explain (in this report) how you changed it in your code.

## Rate Limiting
What enpdoints do you protect from denial of service or any brute force? You don't have to set up a proxy or a load balancer. You can make assumptions about them and then explain what you are doing in your code as an extra level of defense. It must be clear what enpoints you are protecting how (including the configuration details).

## Blue Teaming & Red Teaming
Describe how you tackled both the blue and red teaming activities. If already mentioned above, reference to the above, but make sure you make an overview of both types of activities in here. 

# 04 Injections

## SQL Injection
A red team member experiments with at least 1 offensive tool.
A blue team member accidently writes a bare SQL query without using the JPA (or other ORM). Another blue team member tries to prevent this.

Explain your findings and the mitigations you have put in place. Also explain the protections you have put in place to reduce the risk in case an SQL injection would occur.

## XSS
A red team member experiments with at least 1 offensive tool.
A blue team member accidently writes unsafe front end code that allows an attacker to perform an XSS attack. Another blue team member tries to prevent this.

Explain your findings and the mitigations you have put in place, also the ones to reduce the riskin case an XSS would occur.

## SSRF
<!-- In the signup endpoint for a new user, add a functionality where the user can enter a url to an avatar picture. Write a specific API endpoint for posting this picture. In the back-end, you download the avatar picture and store it somewhere in your projectfolder (in a separate folder /uploads). When the user views theirown user (profile) page, the  -->
Explain whether your application is vulnerable or not to SSRF. If yes, what protections does your team put in place?

Implement an API endpoint url-validate (that is available on a page accessible from the menu) where the response is either an allow or reject. You don't have to fetch the URL (we're just mimicking here and focusing on the protection). Bear in mind that this URL would be fetched in a real production environment and must be safe from SSRF. Blue team members write the API endpoint and the protection, red team member tries to bypass the the protection(s).

## Other
Explain whether your application is vulnerable or not to other injection vulnerabilities.
Explain your findings and the mitigations you have put in place.


# 05 Vulnerable & Outdated Components
<!-- List here the vulnerabilities you have found in direct dependencies or transitive dependencies.
Refer to the SBOM in appendix (don't put it in here). -->

Generate an SBOM for your front and back end. Also check all dependencies and explain here at least 3 of the vulnerabilities which you researched in depth and performed a risk analysis on. Which vulnerabilities did you mitigate and how?

Describe how you generated your SBOM, incl. the tools you used and the issues you encountered.
Also explain where you store it and how you renew it when further developing the application.

Attach the latest offical SBOM(s) as appendices (of your final application).

# 06 & 07 Session Management & Clickjacking

Functionality to add: A secure "change password" functionality (for each type of user).

Explain how session management in your application is performed and implemented (before you had the classes and after you had the classes). Try to understand what the libraries or the framework you use is doing for you and what not. How and where does a session start, where do you store the (session) token, how is the (session) token being transported, verified and terminated? 

Explain the existing and newly implemented security controls used to protect user sessions against session hijacking, session fixation, and CSRF attacks. Do the same for clickjacking. I need to see how you (pen)tested (red teaming) this and how you added blue team tests in your build and test phase.

Are there still some threats you can identify but not protect from (so, where do you accept the risk)?


# 08 Exception Handling, Logging & Monitoring 
Explain how you perform exception handling, what was already in your project and what did you change w.r.t. this course.

Use your framework's default logging framework (for Spring Boot, this is Logback) for 2 types of log: an **app.log** and a **security.log** (for security related events). Make sure you use structured JSON logging when you write to log files (you can keep plain text logging for your console logging). Take into account the best practices as seen in the lab. 

Also, set up an ELK infrastructure with docker compose and have a Filebeat read in your log files. In the video (as a proof of work) I need to see you performing a signup for the same user or failed login attempts for the same user and seeing these log events pop up in Kibana. You don't need to setup Alerting (based on rules).

Add to appendix: 
- an example app.log file from your running application
- an example security.log file from your running application (showing at least a brute force attempt)

# 09 Secure CI / CD
Evaluate the OWASP CI/CD Top 10 against this course's project or another project if you have another project where your pipeline goes further (typically for the Software Engineering course).

# 10 Security Misconfiguration & Insecure Design
We did not expicitly handle both categories from OWASP Top 10 (version 2025), but they were all over the place during the course. Can you identify - per category - at least two mitigations you performed that belong to that category or that you would tackle in case you would have to start whole over again.

# Conclusion 
Write a conclusion (most important thing you changed and learned) and identify at least one (your best) example (per security principle) of how you implemented the security principles.

Also, working together, what was the main point of discussion you had the hardest time agreeing upon?

# Appendices
These appendices must be zipped into an appendices-teamX.zip folder and uploaded on Toledo along with the report and video. The zip file contains the following folders (and respective files):

## Configuration Files
- .env file , tsconfig, ...
- application.properties / application.yml
- docker compose files
- filebeat.yml

## API
- "yyyymmdd API enpoints" (when doing the assessment in week 3)
- "yyyymmdd API enpoints" (the final version with all API endpoints and its authentication/authorization)
- An exported json/yml file from your API spec

## SBOM
Latest version of your SBOM(s) in their original format.
