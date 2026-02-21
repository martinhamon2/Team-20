package be.ucll.UserTests;

import be.ucll.model.Role;
import be.ucll.model.User;
import be.ucll.repository.UserRepository;
import be.ucll.service.UserDetailsImpl;
import be.ucll.service.UserDetailsServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class UserDetailsServiceImplTest {

    @InjectMocks
    UserDetailsServiceImpl userDetailsServiceImpl;

    @Mock
    private UserRepository userRepository;

    @Test
    void loadUserByUsername_returnsUserDetails_whenUserExists() {
        var user = new User("alice", "secret@example", "secret", Role.USER);
        user.setUsername("alice");
        user.setPassword("secret");

        when(userRepository.findByUsername("alice")).thenReturn(Optional.of(user));

        UserDetails details = userDetailsServiceImpl.loadUserByUsername("alice");

        assertThat(details).isNotNull();
        assertThat(details).isInstanceOf(UserDetailsImpl.class);
        verify(userRepository).findByUsername("alice");
    }

    @Test
    void loadUserByUsername_throws_whenUserMissing() {
        when(userRepository.findByUsername("missing")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userDetailsServiceImpl.loadUserByUsername("missing"))
                .isInstanceOf(UsernameNotFoundException.class);

        verify(userRepository).findByUsername("missing");
    }

    @Test
    void updatePassword_updatesUnderlyingUser_andReturnsSameDetails() {
        var user = new User("bob", "old@example", "old", Role.USER);
        user.setUsername("bob");
        user.setPassword("old");

        var details = new UserDetailsImpl(user);

        UserDetails result = userDetailsServiceImpl.updatePassword(details, "newPass");

        assertThat(result).isSameAs(details);
        assertThat(user.getPassword()).isEqualTo("newPass");
        verifyNoInteractions(userRepository);
    }
}
