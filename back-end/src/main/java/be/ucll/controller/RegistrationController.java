package be.ucll.controller;

import be.ucll.controller.dto.RegistrationInput;
import be.ucll.controller.dto.SessionDTO;
import be.ucll.model.Registration;
import be.ucll.service.RegistrationService;
import jakarta.validation.Valid;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import be.ucll.service.JwtService;

@RestController
@RequestMapping("/registration")
public class RegistrationController {

    private final RegistrationService registrationService;

    public RegistrationController(RegistrationService registrationService, JwtService jwtService) {
        this.registrationService = registrationService;
    }

    @GetMapping
    public List<Registration> getAllRegistrations() {
        return registrationService.getAllRegistrations();
    }

    @PostMapping
    public String registrate(@Valid @RequestBody RegistrationInput registrationInput)
            throws Exception {
        return registrationService.registrateUserToSession(registrationInput);
    }

    @DeleteMapping("/cancel/{sessionId}")
    public String getMethodName(@RequestParam String token, @PathVariable String sessionId) {
        return registrationService.cancelSession(token, sessionId);
    }

    @GetMapping("/email/{email}")
    public List<SessionDTO> findByEmail(@PathVariable String email) throws Exception {
        return registrationService.findRegistrationsByEmail(email);
    }

    @PostMapping("/precheck/{email}")
    public String precheck(@PathVariable String email, @RequestBody List<String> sessionIds)
            throws Exception {
        return registrationService.precheck(email, sessionIds);
    }

    @PutMapping("/{id}/{fieldName}")
    public ResponseEntity<?> updateRegistrationField(
            @PathVariable Long id,
            @PathVariable String fieldName,
            @RequestBody String value) {
        try {
            Registration result = registrationService.updateRegistrationField(id, fieldName, value);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            // captures the exception message and sends it back with a 400 Bad Request status.
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}/session/{sessionId}")
    public ResponseEntity<?> removeRegistrationFromSession(
            @PathVariable Long id,
            @PathVariable String sessionId) {
        try {
            registrationService.removeRegistrationFromSession(id, sessionId);
            return ResponseEntity.ok("Gebruiker verwijderd");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

}
