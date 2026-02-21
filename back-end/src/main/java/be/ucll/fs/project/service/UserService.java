package be.ucll.fs.project.service;

import be.ucll.fs.project.controller.dto.AuthenticationResponse;
import be.ucll.fs.project.controller.dto.UserInput;
import be.ucll.fs.project.repository.UserRepository;
import be.ucll.fs.project.unit.model.Role;
import be.ucll.fs.project.unit.model.User;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    @Autowired
    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, AuthenticationManager authenticationManager,
                       JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }


    public List<User> getAdmins() {
        List <User> admins = new ArrayList<>();
        for (User user : userRepository.findAll()) {
            if (user.getRole() == Role.ADMIN) {
                admins.add(user);
            }
        }
        return admins;
    }

    public AuthenticationResponse authenticate(String username, String password) {
        final var usernamePasswordAuthentication = new UsernamePasswordAuthenticationToken(username, password);
        final var authentication = authenticationManager.authenticate(usernamePasswordAuthentication);
        final var user = ((UserDetailsImpl) authentication.getPrincipal()).user();
        final var token = jwtService.generateToken(user);
        return new AuthenticationResponse(
                "Authentication successful.",
                token,
                user.getUsername(),
                user.getRole()
        );
    }

    public User signup(Role role, UserInput userInput) {
        if (userRepository.existsById(userInput.username())){
            throw new RuntimeException("Username is already in use.");
        }

        final var hashedPassword = passwordEncoder.encode(userInput.password());
        final var user = new User(
                userInput.username(),
                hashedPassword,
                role
        );

        return userRepository.save(user);
    }
}
