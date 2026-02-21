package be.ucll.repository;

import be.ucll.model.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import jakarta.annotation.PostConstruct;

@Component
public class DbInitializer {
        private final UserRepository userRepository;
        private final PasswordEncoder passwordEncoder;
        private final RegistrationRepository registrationRepository;

        public DbInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder,
                        RegistrationRepository registrationRepository) {
                this.userRepository = userRepository;
                this.passwordEncoder = passwordEncoder;
                this.registrationRepository = registrationRepository;
        }

        private void clearAll() {
                userRepository.deleteAll();
        }

        @PostConstruct
        public void init() {
                clearAll();

                // USERS
                User admin = new User("admin", "admin@mail.com", passwordEncoder.encode("admin123"), Role.ADMIN);
                userRepository.save(admin);

                Registration registration = new Registration("Nathan", "Jordens", "Leuvenselaan 77/2", "Tienen", 3300,
                                "+32 472 52 03 79", "nathanjordens2005@gmail.com", "UCLL", "Nederlands", 2023, "2006-18-22");
                registration.addSessionId("C-00048835");
                registrationRepository.save(registration);

                Registration registration2 = new Registration("Nathan", "Jordens", "Leuvenselaan 77/2", "Tienen", 3300,
                                "+32 472 52 03 79", "nathanjordens2005@gmail.com", "UCLL", "Frans", 2020, "2005-08-15");
                registration2.addSessionId("C-00048836");
                registrationRepository.save(registration2);
        }
}
