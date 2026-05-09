package be.ucll.fs.project.service;

import be.ucll.fs.project.controller.dto.AuthenticationResponse;
import be.ucll.fs.project.controller.dto.UserInput;
import be.ucll.fs.project.repository.UserRepository;
import be.ucll.fs.project.repository.TwoFactorAuthCodeRepository;
import be.ucll.fs.project.unit.model.Role;
import be.ucll.fs.project.unit.model.User;
import be.ucll.fs.project.unit.model.TwoFactorAuthCode;
import be.ucll.fs.project.exception.SecurityException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Random;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final AvatarService avatarService;
    private final TwoFactorAuthCodeRepository twoFactorRepository;
    private final JavaMailSender mailSender;

    @Autowired
    public UserService(UserRepository userRepository, 
                       PasswordEncoder passwordEncoder, 
                       AuthenticationManager authenticationManager,
                       JwtService jwtService, 
                       AvatarService avatarService,
                       TwoFactorAuthCodeRepository twoFactorRepository,
                       JavaMailSender mailSender) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.avatarService = avatarService;
        this.twoFactorRepository = twoFactorRepository;
        this.mailSender = mailSender;
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

    public Optional<User> getMe() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return Optional.empty();
        }

        return userRepository.findByUsername(authentication.getName());
    }

    @Transactional
    public String authenticateStepOne(String username, String password) {
        long start = System.currentTimeMillis();
        long responseTime = 2000;

        try {
            authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(username, password));
            
            String code = String.format("%06d", new Random().nextInt(1000000));

            twoFactorRepository.deleteByUsername(username);
            twoFactorRepository.save(new TwoFactorAuthCode(username, code));

            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new SecurityException("User not found"));
            
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("security@mail.be");
            message.setTo(user.getEmail());
            message.setSubject("2FA Code");
            message.setText("Code: " + code);
            mailSender.send(message);

            return "Code sent";
        } catch (Exception e) {
            long elapsed = System.currentTimeMillis() - start;
            if (elapsed < responseTime) {
                try { Thread.sleep(responseTime - elapsed); } catch (InterruptedException ignored) {}
            }
            throw new SecurityException("Failed login attempt for user: " + username);
        }
    }

    @Transactional
    public AuthenticationResponse authenticateStepTwo(String username, String code) {
        TwoFactorAuthCode storedCode = twoFactorRepository.findByUsername(username)
                .orElseThrow(() -> new SecurityException("No session"));

        if (storedCode.isExpired() || !storedCode.getCode().equals(code)) {
            throw new SecurityException("Invalid code");
        }

        User user = userRepository.findByUsername(username).orElseThrow();
        String token = jwtService.generateToken(user);
        
        twoFactorRepository.delete(storedCode);

        return new AuthenticationResponse(
                "Authentication successful.",
                token,
                user.getUsername(),
                user.getRole()
        );
    }

    public User signup(Role role, UserInput userInput) {
        if (userRepository.existsById(userInput.username())){
            throw new SecurityException("Signup rejected, username already taken: " + userInput.username());
        }

        final var hashedPassword = passwordEncoder.encode(userInput.password());
        final var user = new User(
                userInput.username(),
                hashedPassword,
                userInput.email(),
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
}