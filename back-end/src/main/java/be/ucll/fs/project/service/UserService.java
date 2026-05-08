package be.ucll.fs.project.service;

import be.ucll.fs.project.controller.dto.AuthenticationResponse;
import be.ucll.fs.project.controller.dto.UserInput;
import be.ucll.fs.project.repository.UserRepository;
import be.ucll.fs.project.unit.model.Role;
import be.ucll.fs.project.unit.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import be.ucll.fs.project.exception.SecurityException;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final AvatarService avatarService;

    @Autowired
    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, AuthenticationManager authenticationManager,
                       JwtService jwtService, AvatarService avatarService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.avatarService = avatarService;
    }

    // Deze shit is niet secure lmao
    // public List<User> getAdmins() {
    //     List <User> admins = new ArrayList<>();
    //     for (User user : userRepository.findAll()) {
    //         if (user.getRole() == Role.ADMIN) {
    //             admins.add(user);
    //         }
    //     }
    //     return admins;
    // }

    public AuthenticationResponse authenticate(String username, String password) {
        try {
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
        } catch (Exception e) {
            throw new SecurityException("Failed login attempt for user: " + username);
        }
    }

    public User signup(Role role, UserInput userInput) {
        if (userRepository.existsById(userInput.username())){
            throw new SecurityException("Signup rejected, username already taken: " + userInput.username());
        }

        final var hashedPassword = passwordEncoder.encode(userInput.password());
        final var user = new User(
                userInput.username(),
                hashedPassword,
                role
        );

        if (userInput.avatarUrl() != null && !userInput.avatarUrl().isBlank()) {
            try {
                String filename = avatarService.downloadAndStore(userInput.username(), userInput.avatarUrl());
                user.setAvatarPath(filename);
            } catch (Exception e) {}
        }

        return userRepository.save(user);
    }

    public void changePassword(String username, String currentPassword, String newPassword) {
        User user = userRepository.findById(username)
                .orElseThrow(() -> new SecurityException("User not found"));

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new SecurityException("Current password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }
}
