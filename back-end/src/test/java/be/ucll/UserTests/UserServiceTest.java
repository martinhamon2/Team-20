package be.ucll.UserTests;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import java.util.ArrayList;
import java.util.List;

import be.ucll.controller.dto.AuthenticationResponse;
import be.ucll.service.JwtService;
import be.ucll.service.UserDetailsImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import be.ucll.exception.UserException;
import be.ucll.model.Role;
import be.ucll.model.User;
import be.ucll.repository.UserRepository;
import be.ucll.service.UserService;

@ExtendWith(MockitoExtension.class)
public class UserServiceTest {
    @Mock
    UserRepository userRepository;

    @Mock
    BCryptPasswordEncoder bCryptPasswordEncoder;

    @Mock
    AuthenticationManager authenticationManager;

    @Mock
    JwtService jwtService;

    @InjectMocks
    UserService userService;

    private User admin;

    private List<User> users;

    @BeforeEach
    public void setUp() throws UserException {
        admin = new User("John", "john.doe@ucll.be", "Secret123!", Role.ADMIN);
        admin.setId((long) 1);
    }

    private List<User> getUsers() {
        users = new ArrayList<User>();
        users.add(admin);
        return users;
    }

    // happy flow
    @Test
    void givenAllUsers_whenGetAllUsers_thenAllUsersAreReturned() throws UserException {
        // given
        when(userRepository.findAll()).thenReturn(getUsers());
        // when
        List<User> users = userService.getAllUsers();
        // then
        assertNotNull(users);
        assertEquals(1, users.size());
        assertEquals(getUsers(), users);
    }

    // happy flow
    @Test
    void givenValidUsernameAndPassword_whenAuthenticating_thenAuthenticationResponseIsReturned() {
        // given
        // Mock authentication result
        UserDetailsImpl userDetails = new UserDetailsImpl(admin);
        Authentication authentication = new UsernamePasswordAuthenticationToken(userDetails, null,
                userDetails.getAuthorities());

        // when
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(authentication);

        when(jwtService.generateToken(any(User.class))).thenReturn("fake-jwt-token");

        AuthenticationResponse authenticationResponse = userService.authenticate(admin.getUsername(),
                admin.getPassword());

        // then
        assertNotNull(authenticationResponse);
        assertEquals("Authentication successful.", authenticationResponse.message());
        assertEquals(admin.getUsername(), authenticationResponse.username());
        assertEquals(admin.getEmail(), authenticationResponse.email());
        assertEquals(admin.getRole(), authenticationResponse.role());
    }

    // happy flow
    @Test
    void givenValidAuthentication_whenPinging_thenUserPongDTOIsReturned() {
        // given
        Authentication authentication = Mockito.mock(Authentication.class);
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getName()).thenReturn(admin.getUsername());
        when(userRepository.findByUsername(admin.getUsername())).thenReturn(java.util.Optional.of(admin));

        // when
        var userPongDTO = userService.ping(authentication);

        // then
        assertNotNull(userPongDTO);
        assertEquals(admin.getId(), userPongDTO.id());
        assertEquals(admin.getUsername(), userPongDTO.username());
        assertEquals(admin.getEmail(), userPongDTO.email());
        assertEquals(admin.getRole(), userPongDTO.role());
    }

    // unhappy flow
    @Test
    void givenInvalidAuthentication_whenPinging_thenRuntimeExceptionIsThrown() {
        // given
        Authentication authentication = Mockito.mock(Authentication.class);
        when(authentication.isAuthenticated()).thenReturn(false);
        // when
        try {
            userService.ping(authentication);
        } catch (RuntimeException e) {
            // then
            assertEquals("Unauthorized", e.getMessage());
        }
    }

    // unhappy flow
    @Test
    void givenNonExistingUser_whenPinging_thenRuntimeExceptionIsThrown() {
        // given
        Authentication authentication = Mockito.mock(Authentication.class);
        // when
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getName()).thenReturn("nonExistingUser");
        when(userRepository.findByUsername("nonExistingUser")).thenReturn(java.util.Optional.empty());
        try {
            userService.ping(authentication);
        } catch (RuntimeException e) {
            // then
            assertEquals("User not found", e.getMessage());
        }
    }
}
