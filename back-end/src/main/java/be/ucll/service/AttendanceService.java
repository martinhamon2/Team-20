package be.ucll.service;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import be.ucll.model.Registration;
import be.ucll.repository.RegistrationRepository;
import jakarta.persistence.EntityNotFoundException;

@Service
public class AttendanceService {
    @Autowired
    private RegistrationRepository registrationRepository;
    private JwtService jwtService;

    public Registration markAttendance(Authentication authentication, String sessionId) {
        String email = authentication.getName();

        // 3. Zoek de registratie
        Registration registration = registrationRepository
                .findByEmailAndSessionIdsContaining(email, sessionId)
                .orElseThrow(() -> new EntityNotFoundException("Geen registratie gevonden voor deze sessie (" + sessionId + ")."));

        

         if (registration.getIsPresent()) {
            throw new IllegalStateException("User " + registration.getEmail() + " is already checked in.");
        }



        registration.setIsPresent(true);

        registrationRepository.save(registration);
        return registration;
    }

}
