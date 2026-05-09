package be.ucll.fs.project.unit.service;

import be.ucll.fs.project.controller.dto.AuthenticationResponse;
import be.ucll.fs.project.controller.dto.UserInput;
import be.ucll.fs.project.repository.UserRepository;
import be.ucll.fs.project.service.JwtService;
import be.ucll.fs.project.service.UserDetailsImpl;
import be.ucll.fs.project.service.UserService;
import be.ucll.fs.project.unit.model.Role;
import be.ucll.fs.project.unit.model.User;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class UserServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private AuthenticationManager authenticationManager;
    @Mock
    private JwtService jwtService;

    @InjectMocks
    private UserService userService;

    // @Test
    // void getAdmins_shouldReturnOnlyAdmins() {
    //     User admin = new User("admin", "pass", Role.ADMIN);
    //     User user = new User("user", "pass", Role.USER);
    //     when(userRepository.findAll()).thenReturn(List.of(admin, user));

    //     List<User> result = userService.getAdmins();

    //     assertEquals(1, result.size());
    //     assertEquals("admin", result.get(0).getUsername());
    // }

    @Test
    void signup_shouldCreateUser_whenUsernameIsUnique() {
        UserInput input = new UserInput("newUser", "password","test@email.be", null);
        when(userRepository.existsById("newUser")).thenReturn(false);
        when(passwordEncoder.encode("password")).thenReturn("encodedPass");
        when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArguments()[0]);

        User created = userService.signup(Role.USER, input);

        assertNotNull(created);
        assertEquals("newUser", created.getUsername());
        assertEquals("encodedPass", created.getPassword());
        verify(userRepository).save(any(User.class));
    }

    // @Test
    // void authenticate_shouldReturnToken_whenCredentialsAreValid() {
    //     String username = "testUser";
    //     String password = "testPassword";
    //     User user = new User(username, "encodedPass","test@email.be", Role.USER);

    //     Authentication authMock = mock(Authentication.class);
    //     UserDetailsImpl userDetails = new UserDetailsImpl(user);
    //     when(authMock.getPrincipal()).thenReturn(userDetails);

    //     when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
    //             .thenReturn(authMock);
    //     when(jwtService.generateToken(user)).thenReturn("mockToken");

    //     AuthenticationResponse response = userService.authenticate(username, password);

    //     assertEquals("mockToken", response.token());
    //     assertEquals(username, response.username());
    // }
}